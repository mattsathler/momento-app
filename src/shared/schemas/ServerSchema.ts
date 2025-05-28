const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnalyticsSchema = new Schema({
    likesToTrend: { type: Number, required: true },
    momentosToVerify: { type: Number, required: true },
    followersToVerify: { type: Number, required: true },
    trendsToVerify: { type: Number, required: true },
    momentosTimeout: { type: Number, required: true },
    followersMultiplier: { type: Number, required: true, default: 1 },
});

const EmojiSchema = new Schema({
    like: { type: String, required: true },
    comment: { type: String, required: true },
    share: { type: String, required: true },
    report: { type: String, required: true },
});

export const ServerSchema = new Schema({
    id: { type: String, required: true },
    analytics: { type: AnalyticsSchema, required: true },
    emojisId: { type: EmojiSchema, required: true },
    trendWebhooks: { type: [String], required: false },
    channelsId: {
        type: {
            themeCatalogue: String
        }, required: false
    }
}); 