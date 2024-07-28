import { createOrder } from "@/lib/actions/transaction.action";
import Plan from "@/lib/database/models/plans.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();

    const { plan:planName, amount, buyerId } = body;
    
  await connectToDatabase();

  // Fetch the plan details from the database
  const plan = await Plan.findOne({ name: planName });
  if (!plan) {
    throw new Error("Invalid plan selected");
  }
  
    
    if (!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET))
      return new Response(
        JSON.stringify({ success: false, message: "Razorpay not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount*100,
      currency: "INR",
      notes:{
        userID: buyerId,
      }
    };
    

    const order = await razorpay.orders.create(options);
    if (!order)
      return new Response(
        JSON.stringify({ success: false, message: "Order creation failed" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


    await createOrder(plan, order,buyerId);
    
    return new Response(JSON.stringify({ success: true, order }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating or activating subscription:", error);
    throw error;
  }
}
