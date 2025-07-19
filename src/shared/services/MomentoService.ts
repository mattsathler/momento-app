import { Client, TextChannel } from "discord.js";
import { AxiosService } from "./AxiosService";
import { getSecureToken } from "./TokenService";
import { User } from "../models/user";

export class MomentoService {
    public static async getUploadChannel(client: Client): Promise<TextChannel> {
        if (!process.env.IMAGE_UPLOAD_CHANNEL_ID) throw new Error("IMAGE_UPLOAD_CHANNEL_ID is not defined in .env")
        const uploadChannel = await client.channels.fetch(process.env.IMAGE_UPLOAD_CHANNEL_ID) as TextChannel;
        return uploadChannel;
    }

    public async sendMomentoNotification(body: any): Promise<void> {
        const axiosService: AxiosService = new AxiosService();
        axiosService.postWebhook("NOTIFICATION_WEBHOOK", body);
    }

    public static isUserVerified(verificationDate: Date) {
        if (!verificationDate) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const verificationDay = new Date(verificationDate);
        verificationDay.setHours(0, 0, 0, 0);

        return verificationDay >= today;
    }


    public static async requestUpdateProfile(author: User, updateCollage: boolean = false): Promise<void> {
        const axiosService: AxiosService = new AxiosService();
        const notificationWebhook = process.env.PROFILE_UPDATER_WEBHOOK as string;
        if (!notificationWebhook) throw new Error("Invalid Webhook URL");
        await axiosService.postWebhook(notificationWebhook, {
            "content": null,
            "embeds": [
                {
                    "color": 14492795,
                    "fields": [
                        {
                            "name": "guild_id",
                            "value": author.guildId
                        },
                        {
                            "name": "target_user_id",
                            "value": author.userId
                        },
                        {
                            "name": "update_profile",
                            "value": "true"
                        },
                        {
                            "name": "update_collage",
                            "value": updateCollage ? 'true' : 'false'
                        },
                        {
                            "name": "sent_from",
                            "value": "momento_analytics"
                        },
                        {
                            "name": "token",
                            "value": getSecureToken(process.env.SECRET_TOKEN || '')
                        }
                    ]
                }
            ],
            "attachments": []
        })
    }
}