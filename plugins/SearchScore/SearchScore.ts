import { bot } from '../../src/test'
import { GfsFileStat, GfsDirStat } from '../../src/gfs'
import { Group } from '../../src/group'

const ex_name: string = "pdf"

bot.on("message.group", async function (msg) {
    // if (msg.member.uid !== admin.account) { return }     // TODO 中间件:命令权限
    if (msg.raw_message.indexOf("/找") !== -1) {
        let filename: string = msg.raw_message.replace('/找', '').trim()
        // console.log(`开始找${filename}的谱子`)
        for (let g of bot.gl.values()) {
            if (g?.group_id === 1090340791) continue //TODO 中间件:黑名单
            let group: Group = await bot.pickGroup(g?.group_id)
            let fid: string[] = await searchFile(filename, ex_name, g?.group_id)  //TODO 插件配置文件:搜索范围
            if (fid[0] !== "-1") {
                let filestat: GfsFileStat | GfsDirStat = await group.fs.stat(fid[0])    //TODO 插件配置文件:用户选择查看第几个文件
                msg.group.fs.forward(filestat as GfsFileStat)
                break
            } else {
                msg.group.sendMsg("找不到哦")
            }
        }
    }
})

/**
 * 搜索群文件
 * @param filename 文件名
 * @param ex_name 文件扩展名
 * @param group_id 群号
 * @param search_range `all` 为全部; `inDir` 在文件夹内搜索; `inRoot` 在根目录搜索
 * @returns 所有结果文件的fid的集合，如果没有则返回["-1"]
*/
async function searchFile(filename: string, ex_name: string, group_id: number, search_range: string = "all"): Promise<string[]> {
    return new Promise(async (resolve) => {
        let group: Group = await bot.pickGroup(group_id)
        let group_files: (GfsDirStat | GfsFileStat)[] = await group.fs.dir()
        let filestats_inRoot: GfsFileStat[] = []
        let filestats_inDir: GfsFileStat[] = []
        let filestats: GfsFileStat[] = []
        let promises: Promise<(GfsFileStat | GfsDirStat)[]>[] = [];
        let result: string[] = []
        let fullname: string = `${filename}.${ex_name}`

        for (let filestat of group_files) {
            if (filestat.is_dir) promises.push(group.fs.dir(filestat.fid));
            else filestats_inRoot.push(filestat as GfsFileStat);
        }
        let filestats_dir = await Promise.all(promises);        //value [Dir1_filestats, Dir2_filestats, Dir3_filestats, ...]
        filestats_dir.forEach((filestats) => {
            filestats.forEach((filestat) => {
                filestats_inDir.push((filestat as GfsFileStat))
            })
        })
        if (search_range === "all") filestats = filestats_inDir.concat(filestats_inRoot)
        if (search_range === "inDir") filestats = filestats_inDir
        if (search_range === "inRoot") filestats = filestats_inRoot

        //判断关键词
        filestats.forEach((filestat) => {
            if (compare(filestat.name, fullname)) result.push(filestat.fid);
            else ;      //匹配失败，查找关键词别名列表
        })

        if (result.length > 0) resolve(result); else resolve(["-1"]);
    });
}

/**
 * 比较两个字符串是否匹配（参数不分先后顺序）
 * @param word1 字符串1
 * @param word2 字符串2
 */
function compare(word1: string, word2: string): boolean {

    word1 = word1.toLowerCase()     //去大小写
    word2 = word2.toLowerCase()

    if(word1.includes(' ') || word2.includes(' ')){   //去空格
        word1 = word1.replace(/\s/g, '')
        word2 = word2.replace(/\s/g, '')
    }
    
    if (word1.includes('(') || word1.includes('（') || word2.includes('(') || word2.includes('（')) {   //去括号
        word1 = word1.replace(/\([^)]*\)/g, '')
        word2 = word2.replace(/\([^)]*\)/g, '')
        word1 = word1.replace(/\（[^）]*\）/g, '')
        word2 = word2.replace(/\（[^）]*\）/g, '')
    }
    
    if (word1 === word2) return true;
    else return false
}