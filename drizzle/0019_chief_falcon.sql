ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "founding_member" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "free_credits_granted_month" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_stripe_customer_id_unique" UNIQUE("stripe_customer_id");--> statement-breakpoint
UPDATE "user" SET "subscription_tier" = 'pro' WHERE "subscription_tier" IN ('monthly','yearly');