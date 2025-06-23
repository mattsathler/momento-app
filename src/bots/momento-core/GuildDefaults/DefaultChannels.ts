import { ChannelType } from "discord.js";

export const DefaultChannels: { [key: string]: { canSendMessage: boolean, isPrivate: boolean, options: any } } = {
    themesCatalogue: {
        canSendMessage: false,
        isPrivate: false,
        options: {
            name: "momento-uploader",
            type: ChannelType.GuildText,
            position: 0,
            reason: "Canal para upload de temas",
            parent: null,
        }
    }
}