CREATE TYPE "public"."avatar_type" AS ENUM('human', 'object');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "avatar" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "avatar_type" NOT NULL,
	"image_url" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_image" (
	"id" text PRIMARY KEY NOT NULL,
	"generation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"image_url" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prompt" text NOT NULL,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"settings" jsonb NOT NULL,
	"used_app_key" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"generation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"image_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_like" (
	"id" text PRIMARY KEY NOT NULL,
	"image_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preset" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"settings" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text DEFAULT 'google' NOT NULL,
	"encrypted_key" text NOT NULL,
	"iv" text NOT NULL,
	"key_hint" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_token_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month" text NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avatar" ADD CONSTRAINT "avatar_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_image" ADD CONSTRAINT "generated_image_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_image" ADD CONSTRAINT "generated_image_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation" ADD CONSTRAINT "generation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_history" ADD CONSTRAINT "generation_history_generation_id_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_like" ADD CONSTRAINT "image_like_image_id_generated_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."generated_image"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_like" ADD CONSTRAINT "image_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preset" ADD CONSTRAINT "preset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_key" ADD CONSTRAINT "user_api_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_token_usage" ADD CONSTRAINT "user_token_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "avatar_user_idx" ON "avatar" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generated_image_generation_idx" ON "generated_image" USING btree ("generation_id");--> statement-breakpoint
CREATE INDEX "generated_image_user_idx" ON "generated_image" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generated_image_public_idx" ON "generated_image" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "generation_user_idx" ON "generation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_status_idx" ON "generation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generation_created_idx" ON "generation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "generation_history_generation_idx" ON "generation_history" USING btree ("generation_id");--> statement-breakpoint
CREATE INDEX "generation_history_created_idx" ON "generation_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "image_like_image_user_idx" ON "image_like" USING btree ("image_id","user_id");--> statement-breakpoint
CREATE INDEX "image_like_image_idx" ON "image_like" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "preset_user_idx" ON "preset" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_api_key_user_provider_idx" ON "user_api_key" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "user_token_usage_user_month_idx" ON "user_token_usage" USING btree ("user_id","month");