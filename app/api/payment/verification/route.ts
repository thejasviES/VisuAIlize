import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { verifyPayment } from "@/lib/actions/transaction.action";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    // getting the details back from our font-end
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
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      buyerId
    } = body;

    // Creating our own digest
    // The format should be like this:
    // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
    const shasum = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET as string
    );

    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    const orderDeatails = await razorpay.orders.fetch(razorpayOrderId);
    
    if(!payment || !orderDeatails) throw new Error("Invalid payment");
    
   if (orderDeatails===undefined||orderDeatails?.notes?.userID !== buyerId)
     throw new Error("Invalid user");
    // comaparing our digest with the actual signature
    if (digest !== razorpaySignature)
      return new Response(
        JSON.stringify({ success: false, message: "Transaction not legit!" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
    const transaction = {
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      paymentMethod: payment.method,
      paymentDetails: payment,
      
    };

    const { sucess } = await verifyPayment(transaction, buyerId);
    if(!sucess) throw new Error("Payment not captured");

    return new Response(
      JSON.stringify({ success: true, message: "Payment successful" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Payment not captured" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
