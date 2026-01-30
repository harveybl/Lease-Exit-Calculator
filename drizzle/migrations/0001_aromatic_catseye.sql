CREATE TABLE "market_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lease_id" uuid NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"source" varchar(50) NOT NULL,
	"source_label" varchar(100),
	"source_metadata" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "make" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "model" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "year" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "msrp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "net_cap_cost" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "residual_percent" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "money_factor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "down_payment" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "disposition_fee" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "purchase_fee" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "months_elapsed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "state_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "start_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "end_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "market_values" ADD CONSTRAINT "market_values_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE cascade ON UPDATE no action;