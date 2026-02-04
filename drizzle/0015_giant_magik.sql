CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"business_name" text NOT NULL,
	"primary_need" text NOT NULL,
	"challenge" text NOT NULL,
	"selected_date" text NOT NULL,
	"selected_time" text NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"admin_email_sent" boolean DEFAULT false NOT NULL,
	"user_email_sent" boolean DEFAULT false NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_email_idx" ON "booking" USING btree ("email");--> statement-breakpoint
CREATE INDEX "booking_date_idx" ON "booking" USING btree ("selected_date");--> statement-breakpoint
CREATE INDEX "booking_created_idx" ON "booking" USING btree ("created_at");