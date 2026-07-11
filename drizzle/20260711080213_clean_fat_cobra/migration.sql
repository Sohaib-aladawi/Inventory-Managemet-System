ALTER TABLE "items" ALTER COLUMN "unit" SET DATA TYPE "item_unit" USING "unit"::"item_unit";--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "unit" SET DEFAULT 'pcs'::"item_unit";