CREATE SCHEMA "housewarming";
--> statement-breakpoint
CREATE TABLE "housewarming"."gifts" (
	"id" text PRIMARY KEY NOT NULL,
	"title_pl" text NOT NULL,
	"title_uk" text NOT NULL,
	"desc_pl" text NOT NULL,
	"desc_uk" text NOT NULL,
	"price" text NOT NULL,
	"quantity" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"shop_url" text,
	"alt_price" text,
	"alt_shop_url" text,
	CONSTRAINT "gifts_quantity_check" CHECK ((quantity IS NULL) OR (quantity >= 1))
);
--> statement-breakpoint
CREATE TABLE "housewarming"."reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_id" text NOT NULL,
	"claimer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "housewarming"."reservations" ADD CONSTRAINT "reservations_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "housewarming"."gifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservations_claimer_idx" ON "housewarming"."reservations" USING btree ("claimer" text_ops);--> statement-breakpoint
CREATE INDEX "reservations_gift_idx" ON "housewarming"."reservations" USING btree ("gift_id" text_ops);