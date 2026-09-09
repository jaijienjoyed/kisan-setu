import { boolean, pgTable, real, serial, text } from "drizzle-orm/pg-core";

export const buyersTable = pgTable("buyers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  crops: text("crops").array().notNull(),
  verified: boolean("verified").notNull().default(true),
  responseTime: text("response_time").notNull(),
  rating: real("rating"),
});

export type Buyer = typeof buyersTable.$inferSelect;