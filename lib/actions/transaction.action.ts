import { handleError } from "../utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import User from "../database/models/user.model";
import { updateCredits } from "./user.actions";

export async function createOrder(
  plan: any,
  razorpayOrder: any,
  buyerId: string
) {
  try {
    // await connectToDatabase();

    // // Fetch the plan details from the database
    // const plan = await Plan.findOne({ name: params.planName });
    // if (!plan) {
    //   throw new Error("Invalid plan selected");
    // }

    // // Create a Razorpay order (you'll need to implement this function)
    // const razorpayOrder = await createRazorpayOrder(plan.amount);

    // Create a new transaction with the order details
    const newTransaction = await Transaction.create({
      orderId: razorpayOrder.id,
      amount: plan.amount,
      plan: plan.name,
      credits: plan.credits,
      buyer: buyerId,
      status: "created",
    });
    return {
      transaction: JSON.parse(JSON.stringify(newTransaction)),
      razorpayOrderId: razorpayOrder.id,
    };
  } catch (error) {
    handleError(error);
  }
}

export async function verifyPayment(params: VerifyPaymentParams, buyerId: string) {
  try {
    await connectToDatabase();

    // Find the transaction by orderId
    const transaction = await Transaction.findOne({ orderId: params.orderId });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update the transaction with payment details
    transaction.status = "paid";
    transaction.paymentId = params.paymentId;
    transaction.paymentMethod = params.paymentMethod;
    transaction.paymentDetails = params.paymentDetails;

    await transaction.save();

    // Update user's credits

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: buyerId },
      { $inc: { creditBalance: transaction.credits } },
      { new: true }
    );
    console.log("updatedUserCredits", updatedUserCredits);
    if (!updatedUserCredits) throw new Error("User credits update failed");

    return { sucess: true };
  } catch (error) {
    // console.log("error",error);
    return { sucess: false };
    handleError(error);
  }
}
