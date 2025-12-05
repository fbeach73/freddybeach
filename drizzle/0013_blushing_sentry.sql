CREATE TABLE "page_view" (
	"id" text PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"visitor_hash" text,
	"is_bot" boolean DEFAULT false NOT NULL,
	"bot_name" text,
	"session_id" text,
	"country" text,
	"city" text,
	"device_type" text,
	"browser" text,
	"os" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "page_view_created_idx" ON "page_view" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_view_path_idx" ON "page_view" USING btree ("path");--> statement-breakpoint
CREATE INDEX "page_view_is_bot_idx" ON "page_view" USING btree ("is_bot");--> statement-breakpoint
CREATE INDEX "page_view_session_idx" ON "page_view" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "page_view_referrer_idx" ON "page_view" USING btree ("referrer");