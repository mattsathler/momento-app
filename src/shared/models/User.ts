import { Fonts } from "./Fonts";
import { Permission } from "./Permission";

export interface User {
    userId: string;
    guildId?: string;
    permission: Permission;
    username: string;
    name: string;
    surname: string;
    bio: string;
    pronouns: string | null;
    references: {
        channelId?: string;
        statsId: string;
        collageId: string;
        notificationId: string;
    }
    styles: {
        collage: number;
        theme: string;
        fonts: Fonts
    }
    imagesUrl: {
        profilePicture: string;
        profileCover: string;
        highlights: string[];
        collage: string[];
    }
    stats: {
        followers: number;
        isVerified: Date;
        notifications: boolean;
        influencyLevel: number;
        lastOnline: Date;
    }
}