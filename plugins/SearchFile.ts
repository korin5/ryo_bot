import { bot } from '../src/test'
import { GfsFileStat } from '../src/gfs'

// TODO 封装函数
bot.on("message.group", function (msg) {
    // if (msg.member.uid !== admin.account) { return }
    if (msg.raw_message.indexOf("/找") !== -1) {
        var songname = msg.raw_message.replace('/找', '').trim()
        console.log(`开始找${songname}的谱子`)
        var is_find:boolean = false
        for(let gp of bot.gl.values()){
            if(gp?.group_id===1090340791) continue
            let group = bot.pickGroup(gp?.group_id)
            group.fs.dir().then(res => {
                for (let i in res) {
                    if (res[i].name === `${songname}.pdf` && !res[i].is_dir) {
                        console.log(`找到谱子 `+res[i].name)
                        group.fs.stat(res[i].fid).then(filestat => {
                            is_find = true
                            msg.group.fs.forward(filestat as GfsFileStat)
                        })
                    }else if(res[i].is_dir){
                        // console.log(`找到文件夹 `+res[i].name)
                        group.fs.dir(res[i].fid).then(res_in_dir=>{
                            for (let i in res_in_dir) {
                                if (res_in_dir[i].name === `${songname}.pdf` && !res_in_dir[i].is_dir) {
                                    console.log(`在${res[i].name}内找到谱子 `+res_in_dir[i].name)
                                    group.fs.stat(res_in_dir[i].fid).then(filestat => {
                                        is_find = true
                                        msg.group.fs.forward(filestat as GfsFileStat)
                                    })
                                }
                                if(is_find) break;
                            }
                        })
                        if(is_find) break;
                    }
                    if(is_find) break;
                }
            })
            if(is_find) break;
        }
        // if(is_find==false){
        //     msg.group.sendMsg('找不到哦')
        // }
    }
})
