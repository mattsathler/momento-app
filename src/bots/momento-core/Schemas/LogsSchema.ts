import { Schema } from "mongoose";

export const LogsSchema = new Schema({
    type: { type: String, required: true },
    timestamp: { type: Date, required: true },
    userId: { type: String, required: false },
    guildId: { type: String, required: false },
    channelId: { type: String, required: false },
    messageId: { type: String, required: false },
});