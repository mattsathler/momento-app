import { Image } from "canvas"

export enum PostType {
    'image',
    'text',
    'video',
    'carousel'
}

export interface IPost {
    _id?: any
    references: {
        ownerId: string,
        guildId: string,
        channelId: string,
        messageId: string | null,
    }   
    stats: {
        type?: string,
        likes: string[],
        date: Date,
        status: IPostStatus,
        isTrending: boolean,
        isRepost: boolean,
    }
    content: {
        images?: string[],
        buffers?: Image[],
        description?: string,
        imageUrl?: string,
        music?: string,
        location?: string,
        hashtags?: string[],
        thumbUrl?: string
        imagesCount: number,
    }
}

export enum IPostStatus {
    active = 'active',
    inactive = 'inactive',
    deleted = 'deleted'
}