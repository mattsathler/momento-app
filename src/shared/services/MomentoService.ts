import { Client, TextChannel } from "discord.js";
import { AxiosService } from "./AxiosService";

export class MomentoService {
    public async getUploadChannel(client: Client): Promise<TextChannel> {
        if (!process.env.IMAGE_UPLOAD_CHANNEL_ID) throw new Error("IMAGE_UPLOAD_CHANNEL_ID is not defined in .env")
        const uploadChannel = await client.channels.fetch(process.env.IMAGE_UPLOAD_CHANNEL_ID) as TextChannel;
        return uploadChannel;
    }

    public async sendMomentoNotification(body: any): Promise<void> {
        const axiosService: AxiosService = new AxiosService();
        axiosService.postWebhook("NOTIFICATION_WEBHOOK", body);
    }
}