import { bot } from '../../src/test'
import { GfsFileStat, GfsDirStat } from '../../src/gfs'
import { Group } from '../../src/group'
import fs from 'fs'
import YAML from 'yaml'

const file = fs.readFileSync('plugins/SearchScore/config.yaml', 'utf8')
const config = YAML.parse(file)

bot.on("message.group", async function (msg) {
    // if (msg.member.uid !== admin.account) { return }     // TODO 中间件:命令权限
    if (msg.raw_message.includes("/找")) {
        var select: number = 0
        var filename: string = msg.raw_message.replace('/找', '').trim()
        //输入  /找one-4
        if (/\-\d+/.test(filename)) {
            const parts = filename.split('-');
            const extractedNumbers: Array<number> = [];
            for (let i = 1; i < parts.length; i++) {
                const number = parseInt(parts[i], 10);
                if (!isNaN(number)) {
                    extractedNumbers.push(number);
                }
            }
            select = parseInt(extractedNumbers.map(number => number.toString()).join('')) - 1
            filename = filename.replace(/-\d+/g, '')
        }

        var is_find: boolean = false
        var search_group_range: string = config.search_group_range
        var search_file_range: string = config.search_file_range
        var search_other: boolean = false


        if ((search_group_range === "all" || search_group_range === "data") && select === 0) {
            //搜索数据库群
            for (let i in config.data_group_list) {
                let group: Group = await bot.pickGroup(config.data_group_list[i])
                let fid: string[] = await searchFile(filename, "pdf", config.data_group_list[i], search_file_range)
                if (fid[0] !== "-1") {
                    let filestat: GfsFileStat | GfsDirStat = await group.fs.stat(fid[0])
                    msg.group.fs.forward(filestat as GfsFileStat)
                    is_find = true
                    break
                }
            }
        }

        if (!is_find && search_group_range === "all") {
            // msg.group.sendMsg("数据库未收录，扩大查找范围")
            search_other = true
        }

        if (search_other || search_group_range === "other") {
            //搜索其他群
            for (let g of bot.gl.values()) {
                if (config.data_group_list.includes(g?.group_id)) continue // 跳过数据库群
                if (config.black_list.includes(g?.group_id)) continue       //跳过黑名单
                let group: Group = await bot.pickGroup(g?.group_id)
                let fid: string[] = await searchFile(filename, "pdf", g?.group_id, search_file_range)
                if (fid[select] && fid[select] !== "-1") {
                    if(select>=2) msg.group.sendMsg(`第${select + 1}个在${group.name}找到了`);
                    else msg.group.sendMsg(`在${group.name}找到了`)
                    let filestat: GfsFileStat | GfsDirStat = await group.fs.stat(fid[select])    //TODO 插件配置文件:用户选择查看第几个文件
                    // console.log("找到了" + fid.length + "个" + filename)
                    // console.log(fid)
                    // console.log("发送了第" + (select + 1) + "个: " + fid[select])
                    msg.group.fs.forward(filestat as GfsFileStat)
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
 * @returns 所有结果文件的fid的集合，如果没有则返回["-1"]
*/
async function searchFile(filename: string, ex_name: string, group_id: number, search_range: string = "all"): Promise<string[]> {
    return new Promise(async (resolve) => {
        var group: Group = await bot.pickGroup(group_id)
        var group_files: (GfsDirStat | GfsFileStat)[] = await group.fs.dir(...[, , 1000])
        var filestats_inRoot: GfsFileStat[] = []
        var filestats_inDir: GfsFileStat[] = []
        var filestats: GfsFileStat[] = []
        var promises: Promise<(GfsFileStat | GfsDirStat)[]>[] = [];
        var result: string[] = []
        var fullname: string = `${filename}.${ex_name}`

        for (let filestat of group_files) {
            if (filestat.is_dir) promises.push(group.fs.dir(...[filestat.fid, , 1000]));
            else if ((filestat as GfsFileStat).name.endsWith(ex_name)) {
                filestats_inRoot.push(filestat as GfsFileStat)
            }
        }
        let filestats_dir = await Promise.all(promises);        //value [Dir1_filestats, Dir2_filestats, Dir3_filestats, ...]
        filestats_dir.forEach((filestats) => {
            filestats.forEach((filestat) => {
                if ((filestat as GfsFileStat).name.endsWith(ex_name)) {
                    filestats_inDir.push((filestat as GfsFileStat))
                }
            })
        })
        if (search_range === "all") filestats = filestats_inDir.concat(filestats_inRoot)
        if (search_range === "inDir") filestats = filestats_inDir
        if (search_range === "inRoot") filestats = filestats_inRoot

        //判断关键词
        filestats.forEach((filestat) => {
            if (compare(filestat.name, fullname)) result.push(filestat.fid);
            else;      //匹配失败，查找关键词别名列表
        })

        if (result.length > 0) resolve(result); else resolve(["-1"]);
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

bot.on("message.private", (msg) => {
    if (msg.raw_message.indexOf("/找") !== -1) {
        msg.friend.sendMsg("请在群聊使用哦")
    }
})