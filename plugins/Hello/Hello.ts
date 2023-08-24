import { bot } from '../../src/test'

bot.on("message", function (msg) {
    if (msg.raw_message === "ryo") {
        msg.reply("Im alive!", false)
    }
    if (msg.raw_message === "/help") {
        msg.reply("还没做呢", false)
    }
})