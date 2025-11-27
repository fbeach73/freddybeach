ALTER TABLE "business" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "business" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "business" ADD COLUMN "badges" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
CREATE INDEX "business_featured_idx" ON "business" USING btree ("is_featured");