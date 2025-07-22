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
