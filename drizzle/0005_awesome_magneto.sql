ALTER TABLE "business" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "business" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_owner_idx" ON "business" USING btree ("owner_id");