import { date, integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const transportRequestsTable = pgTable("transport_requests", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  pickupDate: date("pickup_date", { mode: "string" }).notNull(),
  vehicleType: text("vehicle_type").notNull(),
  status: text("status", { enum: ["requested", "assigned", "completed"] }).notNull().default("requested"),
  estimatedCost: real("estimated_cost").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TransportRequest = typeof transportRequestsTable.$inferSelect;