import { createClient } from '../src/client'
import fs from 'fs'
import YAML from 'yaml'

const file = fs.readFileSync('config.yaml', 'utf8')
const config = YAML.parse(file)

const bot = createClient(config.client_conf)
bot.on('system.login.slider', (e) => {
    console.log('输入滑块地址获取的ticket后继续。\n滑块地址:    ' + e.url)
    process.stdin.once('data', (data) => {
        bot.submitSlider(data.toString().trim())
    })
})
bot.on('system.login.qrcode', (e) => {
    console.log('扫码完成后回车继续:    ')
    process.stdin.once('data', () => {
        bot.login()
    })
})
bot.on('system.login.device', (e) => {
    console.log('请选择验证方式:(1：短信验证   其他：扫码验证)')
    process.stdin.once('data', (data) => {
        if (data.toString().trim() === '1') {
            bot.sendSmsCode()
            console.log('请输入手机收到的短信验证码:')
            process.stdin.once('data', (res) => {
                bot.submitSmsCode(res.toString().trim())
            })
        } else {
            console.log('扫码完成后回车继续：' + e.url)
            process.stdin.once('data', () => {
                bot.login()
            })
        }
    })
})
bot.login(config.bot.account, config.bot.password)
export { bot }

for (let i in config.plugins) {
    require(`../plugins/${config.plugins[i]}/${config.plugins[i]}`)
}

process.on("unhandledRejection", (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})