import { bot } from '../../src/test'
import { GfsFileStat, GfsDirStat } from '../../src/gfs'
import { Group } from '../../src/group'
import fs from 'fs'
import YAML from 'yaml'
import internal from 'stream'

const file = fs.readFileSync('plugins/SearchScore/config.yaml', 'utf8')
const config = YAML.parse(file)

bot.on("message.group", async function (msg) {
    if (!msg.raw_message.includes("/")) return
    const player_list: Array<string> = await get_player_list()

    //输入 `/乐手`
    if (msg.raw_message.replace(/\s/g, '') === "/乐手") {
        const message_list = player_list.map((line, index) => `${index + 1}. ${line}`).join('\n');
        msg.group.sendMsg("乐手列表\n" + message_list)
    }
    //输入 `/井草圣二`
    if (player_list.includes(msg.raw_message.replace(/\s/g, '').replace('/', ''))) {
        const [player] = await get_msg_info(msg.raw_message)
        const song_list = await get_song_list(player)
        const message_list = song_list.map((line, index) => `${index + 1}. ${line}`).join('\n');
        msg.group.sendMsg(`${player}曲目列表\n` + message_list)
    }
    //输入 `/井草圣二-2`
    if (player_list.includes(msg.raw_message.replace(/\s/g, '').replace('/', '').replace(/-\d+/g, '')) && /-\d+/g.test(msg.raw_message)) {
        var [player, arg_num] = await get_msg_info(msg.raw_message)
        var select = arg_num - 1
        var is_find: boolean = false
        const song_list = await get_song_list(player)

        //搜索数据库群
        for (let i in config.data_group_list) {
            let group: Group = await bot.pickGroup(config.data_group_list[i])
            let fid: string[] = await searchFile(song_list[select],player, "pdf", config.data_group_list[i])
            console.log("找的是"+song_list[select])
            console.log(fid)
            if (fid[0]) {
                let filestat: GfsFileStat | GfsDirStat = await group.fs.stat(fid[0])
                msg.group.fs.forward(filestat as GfsFileStat)
                is_find = true
                break
            }
        }
        if (!is_find) {
            msg.group.sendMsg("找不到哦")
        }
    }
})

/**
 * 获取所有数据库群的乐手列表
 * @returns player_list
 */
async function get_player_list() {
    var player_list: Array<string> = []
    for (let group_id of config.data_group_list) {
        var data_group: Group = await bot.pickGroup(group_id)
        var group_files: (GfsDirStat | GfsFileStat)[] = await data_group.fs.dir(...[, , 1000])
        for (let filestat of group_files) {
            if (filestat.is_dir) player_list.push(filestat.name);
        }
    }
    return player_list.sort()
}

/** 
 * 获取所有数据库群收录的指定乐手的曲目列表
 * @param player 乐手名
 * @returns song_list
 */
async function get_song_list(player: string): Promise<string[]> {
    var song_list: Array<string> = []
    for (let group_id of config.data_group_list) {
        var data_group: Group = await bot.pickGroup(group_id)
        var group_files: (GfsDirStat | GfsFileStat)[] = await data_group.fs.dir(...[, , 1000])
        var player_dir_fid: string = ""
        for (let filestat of group_files) {
            if (filestat.is_dir && filestat.name === player) player_dir_fid = filestat.fid; break;
        }
        var player_songs: (GfsDirStat | GfsFileStat)[] = await data_group.fs.dir(...[player_dir_fid, , 1000])
        for (let filestat of player_songs) {
            song_list.push(filestat.name.replace('.pdf', ''));
        }
    }
    return song_list.sort()
}

/**
 * 解析消息 (仅接收数字参数)
 * @param message 消息文本
 * @returns `[乐手名,数字参数,字符参数]` 类型分别为 str , num , str
 */
async function get_msg_info(message: string): Promise<[string, number, string]> {
    var player: string = message.replace(/-\d+/g, '').replace('/', '').trim()
    var arg_num: number = 0
    var arg_str: string = ""
    if (/\-\d+/.test(message)) {
        const parts = message.split('-');
        const extractedNumbers: Array<number> = [];
        for (let i = 1; i < parts.length; i++) {
            const number = parseInt(parts[i], 10);
            if (!isNaN(number)) {
                extractedNumbers.push(number);
            }
        }
        arg_num = parseInt(extractedNumbers.map(number => number.toString()).join(''))
    }
    return [player, arg_num, arg_str]
}

/**
 * 搜索指定乐手的谱子
 * @param filename 谱名
 * @param player 乐手名
 * @param ex_name 文件扩展名
 * @param group_id 群号
 * @returns 所有结果文件的fid的集合，如果没有则返回空 []
*/
async function searchFile(filename: string, player: string, ex_name: string, group_id: number): Promise<string[]> {
    return new Promise(async (resolve) => {
        var group: Group = await bot.pickGroup(group_id)
        var group_files: (GfsDirStat | GfsFileStat)[] = await group.fs.dir(...[, , 1000])
        var filestats_all: GfsFileStat[] = []
        var filestats: GfsFileStat[] = []
        var promises: Promise<(GfsFileStat | GfsDirStat)[]>[] = [];
        var result: string[] = []
        var fullname: string = `${filename}.${ex_name}`

        for (let filestat of group_files) {
            if (filestat.is_dir&&filestat.name===player) promises.push(group.fs.dir(...[filestat.fid, , 1000]));
        }
        let filestats_dir = await Promise.all(promises);        //value [Dir1_filestats, Dir2_filestats, Dir3_filestats, ...]
        filestats_dir.forEach((filestats) => {
            filestats.forEach((filestat) => {
                if ((filestat as GfsFileStat).name.endsWith(ex_name)) {
                    filestats_all.push((filestat as GfsFileStat))
                }
            })
        })

        //判断关键词
        filestats_all.forEach((filestat) => {
            if (compare(filestat.name, fullname)) result.push(filestat.fid);
            else;      //匹配失败，查找关键词别名列表
        })

        if (result.length > 0) resolve(result); else resolve([]);
    });
}

/**
 * 比较两个字符串是否匹配（参数不分先后顺序）
 * @param word1 字符串1
 * @param word2 字符串2
 * @returns 匹配返回 `true` ; 不匹配返回 `false`
 */
function compare(word1: string, word2: string): boolean {

    word1 = word1.toLowerCase()     //去大小写
    word2 = word2.toLowerCase()

    if (word1.includes(' ') || word2.includes(' ')) {   //去空格
        word1 = word1.replace(/\s/g, '')
        word2 = word2.replace(/\s/g, '')
    }

    if (word1.includes('(') || word1.includes('（') || word2.includes('(') || word2.includes('（')) {   //去括号
        word1 = word1.replace(/\([^)]0-9\)/g, '')
        word2 = word2.replace(/\([^)]0-9\)/g, '')
        word1 = word1.replace(/\（[^）]0-9\）/g, '')
        word2 = word2.replace(/\（[^）]0-9\）/g, '')
    }

    if (word1 === word2) return true;
    else return false
}