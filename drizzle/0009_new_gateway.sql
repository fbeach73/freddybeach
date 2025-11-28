ALTER TYPE "public"."business_status" ADD VALUE 'pending_review' BEFORE 'published';--> statement-breakpoint
ALTER TABLE "business" ADD COLUMN "submitted_by_id" text;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_submitted_by_id_user_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;