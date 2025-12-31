
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover" as any, // Cast to any to satisfy specific version type if needed, or use exact string
});

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Q-INTEL Premium",
                            description: "Unlimited Consultations & Idea Vault Access",
                        },
                        unit_amount: 500, // $5.00
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            customer_email: session.user.email,
            success_url: `${process.env.NEXT_PUBLIC_URL}/intelligence?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/intelligence?canceled=true`,
            metadata: {
                userId: session.user.id || "",
            },
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
