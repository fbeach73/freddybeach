CREATE TYPE "public"."business_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "business" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category_id" text,
	"phone" text,
	"email" text,
	"website" text,
	"address" text,
	"city" text DEFAULT 'Fredericton',
	"province" text DEFAULT 'NB',
	"postal_code" text,
	"latitude" real,
	"longitude" real,
	"status" "business_status" DEFAULT 'draft' NOT NULL,
	"google_place_id" text,
	"google_place_data" jsonb,
	"hours" jsonb,
	"rating" real,
	"review_count" integer,
	"image_url" text,
	"images" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_slug_unique" UNIQUE("slug"),
	CONSTRAINT "business_google_place_id_unique" UNIQUE("google_place_id")
);
--> statement-breakpoint
CREATE INDEX "business_status_idx" ON "business" USING btree ("status");--> statement-breakpoint
CREATE INDEX "business_category_idx" ON "business" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "business_google_place_id_idx" ON "business" USING btree ("google_place_id");--> statement-breakpoint
CREATE INDEX "business_slug_idx" ON "business" USING btree ("slug");