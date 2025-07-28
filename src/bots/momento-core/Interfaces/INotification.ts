import { Canvas, Image } from "skia-canvas";
import { IUser } from "./IUser";

export enum NotificationType {
    Embed,
    Image
}

export interface INotification {
    type: NotificationType; 
    targetUser: IUser;
    authorName?: string;
    authorUsername?: string;
    pictureUrl?: string;
    link?: string;
    message?: string;
    thumbnail?: string;
    image?: string;
    fields?: {name: string, value: string}[];
}