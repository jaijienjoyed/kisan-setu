import { pgTable, real, serial, text } from "drizzle-orm/pg-core";

export const priceSnapshotsTable = pgTable("price_snapshots", {
  id: serial("id").primaryKey(),
  crop: text("crop").notNull(),
  localMandi: real("local_mandi").notNull(),
  fairPrice: real("fair_price").notNull(),
  bestBuyerPrice: real("best_buyer_price").notNull(),
  unit: text("unit").notNull(),
  change: real("change").notNull(),
});

export type PriceSnapshot = typeof priceSnapshotsTable.$inferSelect;