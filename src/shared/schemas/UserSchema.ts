import { Schema } from "mongoose";

export const UserSchema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, default: '' },
    permission: { type: String, default: 'user' },
    username: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    bio: { type: String, required: true },
    references: {
        channelId: { type: String, default: '' },
        statsId: { type: String, required: true },
        collageId: { type: String, required: true },
        notificationId: { type: String, required: false },
    },
    styles: {
        collage: { type: Schema.Types.Number, required: true },
        theme: { type: String, required: true },
    },
    imagesUrl: {
        profilePicture: { type: String, required: true },
        profileCover: { type: String, required: false },
        highlights: [{ type: String }],
        collage: [{ type: String }],
    },
    stats: {
        followers: { type: Schema.Types.Number, required: true },
        isVerified: { type: Date, required: true },
        notifications: { type: Boolean, required: true },
        influencyLevel: { type: Schema.Types.Number, required: true, default: 1 },
        lastOnline: { type: Date, required: true }
    },
});
