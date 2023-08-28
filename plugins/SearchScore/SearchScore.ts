import { bot } from '../../src/test'
import { GfsFileStat, GfsDirStat } from '../../src/gfs'
import { Group } from '../../src/group'
import fs from 'fs'
import YAML from 'yaml'

const file = fs.readFileSync('plugins/SearchScore/config.yaml', 'utf8')
const config = YAML.parse(file)

bot.on("message.group", async function (msg) {
    // if (msg.member.uid !== admin.account) { return }     // TODO 中间件:命令权限
    //输入  /找ONE
    //返回  ONE.pdf
    //输入  /找ONE-3
    //返回  第三个 ONE.pdf
    if (msg.raw_message.includes("/找") && !/-\d+-\d+/.test(msg.raw_message)) {
        var [filename, arg_num] = await get_msg_info(msg.raw_message.replace('/找', ''))
        var select: number = arg_num <= 0 ? 0 : arg_num - 1
        var fid: string[] = []
        var search_group_range: string = config.search_group_range
        var search_file_range: string = config.search_file_range
        var is_find: boolean = false

        //搜索数据库群
        if (search_group_range !== "other") {
            for (let i in config.data_group_list) {
                let group: Group = await bot.pickGroup(config.data_group_list[i])
                fid.push(...await searchFile(filename, "pdf", config.data_group_list[i], search_file_range))
                if (fid[select]) {
                    let filestat: GfsFileStat | GfsDirStat = await group.fs.stat(fid[select])
                    msg.group.fs.forward(filestat as GfsFileStat)
                    console.log(`${filestat.name}转发自数据库`)
                    is_find = true
                    break
                }
            }
        }

        //搜索其他群
        if ((search_group_range !== "data") && !is_find) {
            for (let g of bot.gl.values()) {
                if (config.data_group_list.includes(g?.group_id)) continue // 跳过数据库群
                if (config.black_list.includes(g?.group_id)) continue       //跳过黑名单
                let group: Group = await bot.pickGroup(g?.group_id)
                fid.push(...await searchFile(filename, "pdf", g?.group_id, search_file_range))
                if (fid[select]) {
                    // if (select >= 2) msg.group.sendMsg(`第${select + 1}个转发自${group.group_id}`);
                    // else msg.group.sendMsg(`转发自${group.group_id}`)
                    // msg.group.sendMsg(`转发自${group.group_id}`)
                    let filestat: GfsFileStat | GfsDirStat = await group.fs.stat(fid[select])
                    msg.group.fs.forward(filestat as GfsFileStat)
                    console.log(`${filestat.name}转发自${group.group_id}`)
                    is_find = true
                    break
                }
            }
        }
        if (!is_find) {
            msg.group.sendMsg("找不到哦")
        }
    }
})

/**
 * 搜索群文件
 * @param filename 文件名
 * @param ex_name 文件扩展名
 * @param group_id 群号
 * @param search_range `all` 全部(默认); `inDir` 在文件夹内搜索; `inRoot` 在根目录搜索
 * @returns 所有结果文件的fid的集合，如果没有则返回空 []
*/
async function searchFile(filename: string, ex_name: string, group_id: number, search_range: string = "all"): Promise<string[]> {
    return new Promise(async (resolve) => {
        var group: Group = await bot.pickGroup(group_id)
        // 由于api只支持一次请求100个文件，所以需要获取群文件数量，进行循环请求
        var group_files: (GfsDirStat | GfsFileStat)[] = await group.fs.dir(...[, 0, 100])
        for (let index = 1; index < 15; index++) {
            var next_files: (GfsDirStat | GfsFileStat)[] = await group.fs.dir('/', index * 100, index * 100 + 100)
            if (next_files.length === 0) break
            group_files.push(...next_files)
        }
        var filestats_inRoot: GfsFileStat[] = []
        var filestats_inDir: GfsFileStat[] = []
        var filestats: GfsFileStat[] = []
        var promises: Promise<(GfsFileStat | GfsDirStat)[]>[] = [];
        var result: string[] = []
        var fullname: string = `${filename}.${ex_name}`
        var dir_pid_list: string[] = []

        for (let filestat of group_files) {
            // if (filestat.is_dir) promises.push(group.fs.dir(filestat.fid,0 , 100));
            if (filestat.is_dir) dir_pid_list.push(filestat.fid);
            else if ((filestat as GfsFileStat).name.endsWith(ex_name)) {
                filestats_inRoot.push(filestat as GfsFileStat)
            }
        }
        let filestats_dir: (GfsDirStat | GfsFileStat)[] = []
        for (let pid of dir_pid_list) {
            filestats_dir.push(...await group.fs.dir(pid, 0, 100))
            for (let index = 1; index < 15; index++) {
                var next_files: (GfsDirStat | GfsFileStat)[] = await group.fs.dir(pid, index * 100, index * 100 + 100)
                if (next_files.length === 0) break
                filestats_dir.push(...next_files)
            }
        }
        filestats_dir.forEach((filestat) => {
            if ((filestat as GfsFileStat).name.endsWith(ex_name)) {
                filestats_inDir.push((filestat as GfsFileStat))
            }
        })

        if (search_range === "all") filestats = filestats_inDir.concat(filestats_inRoot)
        if (search_range === "inDir") filestats = filestats_inDir
        if (search_range === "inRoot") filestats = filestats_inRoot

        //判断关键词
        filestats.forEach((filestat) => {
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
        word1 = word1.replace(/\([^)]*\d+[^)]*\)/g, '')
        word2 = word2.replace(/\([^)]*\d+[^)]*\)/g, '')
        word1 = word1.replace(/\（[^）]*\d+[^）]*\）/g, '')
        word2 = word2.replace(/\（[^）]*\d+[^）]*\）/g, '')
    }

    if (word1 === word2) return true;
    else return false
}

/**
 * 解析消息 (考虑到文件名可能包含 `-` ,所以目前仅支持数字参数)
 * @param message 消息文本
 * @returns `[文件名,数字参数,字符参数]` 类型分别为 str , num , str
 */
async function get_msg_info(message: string): Promise<[string, number, string]> {
    var filename: string = message.trim().replace(/-\d+/g, '')
    var arg_num: number = 0
    var arg_str: string = ""
    var match = message.match(/-(\d+)/)
    if (match) arg_num = parseInt(match[1]);
    return [filename, arg_num, arg_str]
}

bot.on("message.private", (msg) => {
    if (msg.raw_message.includes("/找")) {
        msg.friend.sendMsg("请在群内使用哦")
    }
})