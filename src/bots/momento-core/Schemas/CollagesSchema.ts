import { Schema } from "mongoose";

export const CollagesSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    authorId: { type: String, required: true, unique: false },
    isExclusive: { type: Boolean, required: true, unique: false },
    gridTemplateColumns: { type: Number, required: true, unique: false },
    gridTemplateRows: { type: Number, required: true, unique: false },
    positions: [{ type: String, required: true, unique: false }]
});
