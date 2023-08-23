import { bot } from '../../src/test'
import { GfsFileStat, GfsDirStat } from '../../src/gfs'
import { Group } from '../../src/group'
import fs from 'fs'
import YAML from 'yaml'
import internal from 'stream'

const file = fs.readFileSync('plugins/SearchScore/config.yaml', 'utf8')
const config = YAML.parse(file)

bot.on("message.group", async function (msg) {
var player_list: Array<string> = await get_player_list()
    //输入 `/乐手`
    if (msg.raw_message.replace(/\s/g, '') === "/乐手") {
        const message_list = player_list.map((line, index) => `${index + 1}. ${line}`).join('\n');
        msg.group.sendMsg("乐手列表\n" + message_list)
    }
    //输入 `/井草圣二`
    if (player_list.includes(msg.raw_message.replace(/\s/g, '').replace('/', ''))) {
        const player = msg.raw_message.replace(/\s/g, '').replace('/', '')
        const song_list = await get_song_list(player)
        const message_list = song_list.map((line, index) => `${index + 1}. ${line}`).join('\n');
        msg.group.sendMsg(`${player}曲目列表\n` + message_list)
    }
    //输入 `/井草圣二-2`
    if (player_list.includes(msg.raw_message.replace(/\s/g, '').replace('/', '')) && /-\d+/g.test(msg.raw_message)) {
        console.log("发送曲谱")
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
    return player_list
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
    return song_list
}