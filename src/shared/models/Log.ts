export interface Log {
    type: LogType;
    timestamp: Date;
    userId?: string;
    guildId?: string;
    channelId?: string;
    messageId?: string;
}

export enum LogType {
    Post = 'post',
    Like = 'like',
    Comment = 'comment',
    Share = 'share',
}