import { bot } from '../src/test'
import { GfsFileStat, GfsDirStat } from '../src/gfs'
import { Group } from '../src/group'

const ex_name: string = "pdf"

bot.on("message.group", async function (msg) {
    // if (msg.member.uid !== admin.account) { return }     // TODO 中间件:命令权限
    if (msg.raw_message.indexOf("/找") !== -1) {
        var filename:string = msg.raw_message.replace('/找', '').trim()
        // console.log(`开始找${filename}的谱子`)
        for (let g of bot.gl.values()) {
            if (g?.group_id === 1090340791) continue //TODO 中间件:黑名单
            var group: Group = await bot.pickGroup(g?.group_id)
            var fid: string[] = await searchFile(filename, ex_name, g?.group_id)  //TODO 插件配置文件:搜索范围
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
async function searchFile(filename: string, ex_name: string, group_id: number, search_range:string="all"): Promise<string[]> {
    return new Promise(async (resolve) => {
        let group: Group = await bot.pickGroup(group_id)
        let group_files:(GfsDirStat | GfsFileStat)[] = await group.fs.dir()
        let result_inRoot: string[] = []
        let result_inDir: string[] = []
        let promises: Promise<(GfsFileStat | GfsDirStat)[]>[] = [];
        let result_all: string[] = []

        for (let filestat of group_files) {
            if (filestat.is_dir) promises.push(group.fs.dir(filestat.fid));
            else result_inRoot.push(filestat.fid);
        }
        let filestats_dir = await Promise.all(promises);        //value [Dir1_filestats, Dir2_filestats, Dir3_filestats, ...]
        filestats_dir.forEach((filestats) => {
            filestats.forEach((filestat) => {
                if (filestat.name === `${filename}.${ex_name}`) result_inDir.push((filestat as GfsFileStat).fid)
            })
        })
        result_all = result_inDir
        if(search_range==="all") result_all = result_inDir.concat(result_inRoot)
        if(search_range==="inDir") result_all = result_inDir
        if(search_range==="inRoot") result_all = result_inRoot
        if (result_all.length > 0) resolve(result_all); else resolve(["-1"]);
    });
}