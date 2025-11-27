CREATE TYPE "public"."claim_role" AS ENUM('owner', 'manager', 'authorized_representative');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'client' BEFORE 'admin';--> statement-breakpoint
CREATE TABLE "claim" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "claim_role" NOT NULL,
	"phone" text NOT NULL,
	"description" text NOT NULL,
	"status" "claim_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text
);
--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "claim_status_idx" ON "claim" USING btree ("status");--> statement-breakpoint
CREATE INDEX "claim_business_idx" ON "claim" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "claim_user_idx" ON "claim" USING btree ("user_id");