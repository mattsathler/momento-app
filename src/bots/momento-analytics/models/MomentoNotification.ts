export interface MomentoNotification {
    type: string;
    title?: string;
    message: string;
    sent_from: string;
    timestamp: Date;
    url?: string;
    image_url?: string;
    thumbnail_url: string;
    author: {
        author_username: string;
        icon_url?: string;
    };
    target: {
        user_id: string;
        profile_channel_id: string;
    }
    footer?: {
        text: string;
        icon_url?: string;
    };
    guildId: string;
}