export interface ILog {
    type: logType;
    timestamp: Date;
    userId?: string;
    guildId?: string;
    channelId?: string;
    messageId?: string;
}

export enum logType {
    Post = 'post',
    Like = 'like',
    Comment = 'comment',
    Share = 'share',
}