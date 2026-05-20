CREATE TYPE "public"."review_request_status" AS ENUM('sent', 'opened', 'submitted', 'expired');--> statement-breakpoint
CREATE TABLE "business_review_settings" (
	"business_id" text PRIMARY KEY NOT NULL,
	"google_review_url" text,
	"brand_color" text,
	"logo_url" text,
	"sender_name" text,
	"sender_signature" text,
	"notification_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"business_id" text NOT NULL,
	"rating" integer NOT NULL,
	"message" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_request" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"token" text NOT NULL,
	"status" "review_request_status" DEFAULT 'sent' NOT NULL,
	"rating" integer,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"opened_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_request_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "business_review_settings" ADD CONSTRAINT "business_review_settings_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_feedback" ADD CONSTRAINT "review_feedback_request_id_review_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."review_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_feedback" ADD CONSTRAINT "review_feedback_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_request" ADD CONSTRAINT "review_request_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_feedback_business_idx" ON "review_feedback" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "review_feedback_submitted_idx" ON "review_feedback" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "review_request_business_idx" ON "review_request" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "review_request_status_idx" ON "review_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_request_sent_at_idx" ON "review_request" USING btree ("sent_at");