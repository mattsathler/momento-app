import { Schema } from "mongoose";

export const ThemesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    creatorId: {
        type: String,
        required: true,
    },
    is_system_theme: {
        type: Boolean,
        required: true,
    },
    last_use: {
        type: Date,
        required: true
    },
    images: {
        'profile-background': { type: String, default: null, required: false },
        'collage-background': { type: String, default: null, required: false },
    },
    colors: {
        primary: {
            type: String,
            required: true,
        },
        secondary: {
            type: String,
            required: true,
        },
        background: {
            type: String,
            required: true,
        }
    },
});
