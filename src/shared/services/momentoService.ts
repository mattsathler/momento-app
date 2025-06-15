import { Client, Guild, TextChannel } from "discord.js";

export class MomentoService {
    public async getUploadChannel(client: Client): Promise<TextChannel> {
        if (!process.env.IMAGE_UPLOAD_CHANNEL_ID) throw new Error("IMAGE_UPLOAD_CHANNEL_ID is not defined in .env")
        const uploadChannel = await client.channels.fetch(process.env.IMAGE_UPLOAD_CHANNEL_ID) as TextChannel;
        return uploadChannel;
    }
}