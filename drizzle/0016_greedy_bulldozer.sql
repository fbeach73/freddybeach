CREATE TYPE "public"."tool_access_type" AS ENUM('free', 'gifted', 'trial', 'paid');--> statement-breakpoint
CREATE TABLE "business_tool" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"tool_slug" text NOT NULL,
	"access_type" "tool_access_type" DEFAULT 'free' NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"granted_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_tool" ADD CONSTRAINT "business_tool_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_tool" ADD CONSTRAINT "business_tool_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_tool_business_slug_idx" ON "business_tool" USING btree ("business_id","tool_slug");--> statement-breakpoint
CREATE INDEX "business_tool_slug_idx" ON "business_tool" USING btree ("tool_slug");