import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { sendPaymentFailedEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${msg}` },
        { status: 400 }
      );
    }

    const { type, data } = event;

    if (type === "checkout.session.completed") {
      const session = data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const stripeCustomerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && stripeCustomerId && subscriptionId) {
        // Find existing subscription for this user, or create a new one.
        const existing = await prisma.subscription.findFirst({
          where: { userId },
        });

        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              stripeCustomerId,
              stripeSubscriptionId: subscriptionId,
              status: "active",
              plan: "PRO",
            },
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId,
              stripeCustomerId,
              stripeSubscriptionId: subscriptionId,
              status: "active",
              plan: "PRO",
            },
          });
        }

        await createAuditLog({
          userId,
          action: "SUBSCRIPTION_CREATED",
          entityType: "Subscription",
          entityId: subscriptionId,
        });
      }
    } else if (type === "customer.subscription.updated") {
      const subscription = data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      await createAuditLog({
        action: "SUBSCRIPTION_UPDATED",
        entityType: "Subscription",
        entityId: subscription.id,
      });
    } else if (type === "customer.subscription.deleted") {
      const subscription = data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "canceled" },
      });

      await createAuditLog({
        action: "SUBSCRIPTION_CANCELED",
        entityType: "Subscription",
        entityId: subscription.id,
      });
    } else if (type === "invoice.payment_failed") {
      const invoice = data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const sub = await prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId },
        include: { user: { select: { email: true } } },
      });

      if (sub?.user?.email) {
        await sendPaymentFailedEmail(sub.user.email);
      }

      await createAuditLog({
        action: "PAYMENT_FAILED",
        entityType: "Subscription",
        entityId: customerId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
