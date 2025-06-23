import { Message } from "discord.js"

export async function tryDeleteMessage(message: Message) {
    try {
        await message.delete()
        return
    }
    catch (err) {
        // console.log("Error trying to delete message", err);
        return
    }
}
