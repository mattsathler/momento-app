import { Schema } from "mongoose";

export const SubscriptionSchema = new Schema({
    label: { type: String, required: true },
    period_in_months: { type: Schema.Types.Number, required: true },
    price: { type: Schema.Types.Number, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
});
