import { db, buyersTable, listingsTable, priceSnapshotsTable } from "@workspace/db";
import { logger } from "./logger";

export async function seedDemoData(): Promise<void> {
  const [buyerRows, priceRows, listingRows] = await Promise.all([
    db.select({ id: buyersTable.id }).from(buyersTable).limit(1),
    db.select({ id: priceSnapshotsTable.id }).from(priceSnapshotsTable).limit(1),
    db.select({ id: listingsTable.id }).from(listingsTable).limit(1),
  ]);

  if (buyerRows.length === 0) {
    await db.insert(buyersTable).values([
      { name: "Mandi Fresh Collective", category: "Wholesale collective", location: "Nashik, Maharashtra", crops: ["Onion", "Tomato", "Grapes"], verified: true, responseTime: "Replies in 2 hrs", rating: 4.9 },
      { name: "GreenCart Foods", category: "Retail network", location: "Pune, Maharashtra", crops: ["Tomato", "Okra", "Potato"], verified: true, responseTime: "Replies in 4 hrs", rating: 4.7 },
      { name: "Bharat Harvest Co.", category: "Institutional buyer", location: "Ahmednagar, Maharashtra", crops: ["Onion", "Wheat", "Chickpea"], verified: true, responseTime: "Replies in 1 day", rating: 4.6 },
    ]);
  }

  if (priceRows.length === 0) {
    await db.insert(priceSnapshotsTable).values([
      { crop: "Tomato", localMandi: 24, fairPrice: 28.5, bestBuyerPrice: 31.2, unit: "kg", change: 8.2 },
      { crop: "Onion", localMandi: 20.5, fairPrice: 24, bestBuyerPrice: 26.8, unit: "kg", change: 5.4 },
      { crop: "Okra", localMandi: 38, fairPrice: 43, bestBuyerPrice: 46.5, unit: "kg", change: 11.1 },
      { crop: "Wheat", localMandi: 25, fairPrice: 27.5, bestBuyerPrice: 29, unit: "kg", change: 2.8 },
    ]);
  }

  if (listingRows.length === 0) {
    await db.insert(listingsTable).values([
      { farmerName: "Suresh Patil", crop: "Tomato", quantity: 850, unit: "kg", askingPrice: 31.2, marketPrice: 24, location: "Nashik, Maharashtra", harvestDate: "2026-09-14", status: "available", verified: true },
      { farmerName: "Meena Jadhav", crop: "Onion", quantity: 1200, unit: "kg", askingPrice: 26.8, marketPrice: 20.5, location: "Ahmednagar, Maharashtra", harvestDate: "2026-09-16", status: "available", verified: true },
      { farmerName: "Ramesh Shinde", crop: "Okra", quantity: 420, unit: "kg", askingPrice: 46.5, marketPrice: 38, location: "Pune, Maharashtra", harvestDate: "2026-09-12", status: "available", verified: true },
      { farmerName: "Asha More", crop: "Wheat", quantity: 2.5, unit: "quintal", askingPrice: 2900, marketPrice: 2500, location: "Satara, Maharashtra", harvestDate: "2026-09-20", status: "reserved", verified: true },
    ]);
  }

  logger.info("Kisan Setu demo data is ready");
}