const mongoose = require('mongoose');
const { Schema } = mongoose;

export const PostsSchema = new Schema({
    references: {
        ownerId: { type: String, required: true },
        guildId: { type: String, required: true },
        channelId: { type: String, required: true },
        messageId: { type: String, required: true },
    },
    stats: {
        type: { type: String, default: 'image' },
        likes: { type: [String], default: [] },
        comments: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
        status: { type: String, default: 'active' },
        isTrending: { type: Boolean, default: false },
        isRepost: { type: Boolean, default: false }
    },
    content: {
        description: { type: String },
        imageUrl: { type: String },
        music: { type: String },
        location: { type: String },
        hashtags: { type: [String], default: [] },
        thumbUrl: { type: String },
        imagesCount: { type: Number, default: 0 }
    },
});