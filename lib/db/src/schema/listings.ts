import { createInsertSchema } from "drizzle-zod";
import { boolean, date, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  farmerName: text("farmer_name").notNull(),
  crop: text("crop").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  askingPrice: real("asking_price").notNull(),
  marketPrice: real("market_price").notNull(),
  location: text("location").notNull(),
  harvestDate: date("harvest_date", { mode: "string" }).notNull(),
  status: text("status", { enum: ["available", "reserved", "sold"] }).notNull().default("available"),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true,
  status: true,
  verified: true,
  createdAt: true,
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;

export const listingStatusValues = ["available", "reserved", "sold"] as const;