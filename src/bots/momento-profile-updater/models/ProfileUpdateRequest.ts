import { Message } from "discord.js"

export type ProfileUpdateRequest = {
    message: Message,
    guildId: string,
    target_user_id: string,
    update_profile?: boolean,
    update_collage?: boolean,
}