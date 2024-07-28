

import mongoose, { Document, Model } from "mongoose";

export interface IPlan extends Document {
  name: string;
  amount: number;
  credits: number;
}

const PlanSchema = new mongoose.Schema<IPlan>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
});

export const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);

export default Plan;
