import { bot } from '../src/test'
import { GfsFileStat } from '../src/gfs'
import { Group } from '../src/group'

const ex_name: string = "pdf"

// TODO 封装函数
bot.on("message.group", function (msg) {
    // if (msg.member.uid !== admin.account) { return }
    if (msg.raw_message.indexOf("/找") !== -1) {
        var filename = msg.raw_message.replace('/找', '').trim()
        // console.log(`开始找${filename}的谱子`)
        var is_find: boolean = false
        for (let g of bot.gl.values()) {
            if (g?.group_id === 1090340791) continue //TODO 黑名单
            let group: Group = bot.pickGroup(g?.group_id)
            group.fs.dir().then(groupfiles => { //获取到目录下所有文件
                for (let i in groupfiles) {
                    //目录
                    if (groupfiles[i].is_dir) {
                        group.fs.dir(groupfiles[i].fid).then(res_in_dir => {
                            for (let i in res_in_dir) {
                                if (res_in_dir[i].name === `${filename}.${ex_name}` && !res_in_dir[i].is_dir && !is_find) {
                                    console.log(`在文件夹内找到谱子 ` + res_in_dir[i].name)
                                    group.fs.stat(res_in_dir[i].fid).then(filestat => {
                                        msg.group.fs.forward(filestat as GfsFileStat)
                                    })
                                    is_find = true
                                    break
                                }
                            }
                        })
                    }
                    //文件
                    if (groupfiles[i].name === `${filename}.${ex_name}` && !groupfiles[i].is_dir && !is_find) {
                        console.log(`找到谱子 ` + groupfiles[i].name)
                        group.fs.stat(groupfiles[i].fid).then(filestat => {
                            msg.group.fs.forward(filestat as GfsFileStat)
                        })
                        is_find = true
                        break
                    }
                    if (is_find) break
                }
            })
            if (is_find) break
        }
    }
})