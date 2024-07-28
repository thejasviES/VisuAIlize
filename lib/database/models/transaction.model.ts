import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },
  status: {
    type: String,
    required: true,
    enum: ["created", "paid", "failed"],
    default: "created",
  },
  plan: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentMethod: {
    type: String,
  },
  paymentDetails: {
    type: Schema.Types.Mixed,
  },
});

// Add a compound index to ensure uniqueness of orderId and buyer
TransactionSchema.index({ orderId: 1, buyer: 1 }, { unique: true });

// Update the updatedAt field on save
TransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Transaction =
  models?.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
