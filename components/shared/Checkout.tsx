"use client";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "../ui/button";

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const { toast } = useToast();
  const { isLoaded, isSignedIn, user } = useUser();
  const handleSubscriptionPayment = async () => {
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          amount,
          credits,
          buyerId,
        }),
      });
      if (!isLoaded || !isSignedIn || !user) {
        return null;
      }

      const email = user.emailAddresses[0].emailAddress;
      const username = user.username;

      const response = await res.json();
      const { amount: amount1, id: order_id, currency } = response.order;

      var options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order_id,
        currency: currency,
        name: username,
        description: `${plan} Subscription Transaction`,
        // image:
        //   "https://media.licdn.com/dms/image/D4D0BAQEtDaqTFg52Jw/company-logo_200_200/0/1689616485572/wisecounselai_logo?e=2147483647&v=beta&t=bVm71Bu1UR7UOC_4TROW4UDUsduzUbOou2WKYjHKDHQ",
        handler: async function (response: any) {
          const data = {
            orderCreationId: order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            buyerId,
          };

          const res = await fetch("/api/payment/verification", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });

          const body = await res.json();

          if (body.success) {
            toast({
              title: "Payment successful",
              description:
                "Your payment was successful. You can now use the credits",
              className: "bg-green-500 text-white border-green-600",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Payment failed",
              description: "Your payment failed. Please try again.",
            });
          }
        },
        prefill: {
          name: username,
          email: email,
        },
        notes: {
          address: "",
        },
        theme: {
          color: "#7857ff",
        },
      };

      const razor = new (window as any).Razorpay(options);
      razor.on("Payment failed", function (response: any) {
        alert(response.error.description);
      });
      razor.open();
    } catch (error) {
      console.error("Error in payment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Button
      type="submit"
      role="link"
      className="w-full rounded-full bg-purple-gradient bg-cover"
      onClick={handleSubscriptionPayment}
    >
      Buy Credit
    </Button>
  );
};

export default Checkout;
