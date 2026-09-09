import { and, desc, eq, ilike, type SQL } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, buyersTable, listingsTable, priceSnapshotsTable, transportRequestsTable } from "@workspace/db";
import {
  CreateListingBody,
  CreateListingResponse,
  CreateTransportRequestBody,
  CreateTransportRequestResponse,
  GetDashboardSummaryResponse,
  GetListingParams,
  GetListingResponse,
  GetPriceSnapshotResponse,
  ListBuyersResponse,
  ListListingsQueryParams,
  ListListingsResponse,
  UpdateListingBody,
  UpdateListingParams,
  UpdateListingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const asDateOnly = (value: Date): string => value.toISOString().slice(0, 10);

router.get("/market/listings", async (req, res): Promise<void> => {
  const query = ListListingsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (query.data.crop) {
    conditions.push(ilike(listingsTable.crop, `%${query.data.crop}%`));
  }
  if (query.data.location) {
    conditions.push(ilike(listingsTable.location, `%${query.data.location}%`));
  }
  if (query.data.status) {
    conditions.push(eq(listingsTable.status, query.data.status));
  }

  const baseQuery = db.select().from(listingsTable).orderBy(desc(listingsTable.createdAt)).$dynamic();
  const listings = conditions.length > 0
    ? await baseQuery.where(and(...conditions))
    : await baseQuery;

  res.json(ListListingsResponse.parse(listings));
});

router.post("/market/listings", async (req, res): Promise<void> => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [listing] = await db.insert(listingsTable).values({
    farmerName: parsed.data.farmerName,
    crop: parsed.data.crop,
    quantity: parsed.data.quantity,
    unit: parsed.data.unit,
    askingPrice: parsed.data.askingPrice,
    marketPrice: parsed.data.marketPrice,
    location: parsed.data.location,
    harvestDate: asDateOnly(parsed.data.harvestDate),
    status: "available",
    verified: true,
  }).returning();

  res.status(201).json(CreateListingResponse.parse(listing));
});

router.get("/market/listings/:id", async (req, res): Promise<void> => {
  const params = GetListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.json(GetListingResponse.parse(listing));
});

router.patch("/market/listings/:id", async (req, res): Promise<void> => {
  const params = UpdateListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateListingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [listing] = await db.update(listingsTable)
    .set(body.data)
    .where(eq(listingsTable.id, params.data.id))
    .returning();
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.json(UpdateListingResponse.parse(listing));
});

router.get("/market/buyers", async (_req, res): Promise<void> => {
  const buyers = await db.select().from(buyersTable);
  res.json(ListBuyersResponse.parse(buyers));
});

router.get("/market/price-snapshot", async (_req, res): Promise<void> => {
  const prices = await db.select().from(priceSnapshotsTable);
  res.json(GetPriceSnapshotResponse.parse(prices));
});

router.post("/market/transport-requests", async (req, res): Promise<void> => {
  const parsed = CreateTransportRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, parsed.data.listingId));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const vehicleCosts: Record<string, number> = {
    "mini-truck": 1800,
    pickup: 2400,
    lorry: 3200,
  };
  const [request] = await db.insert(transportRequestsTable).values({
    listingId: parsed.data.listingId,
    pickupLocation: parsed.data.pickupLocation,
    pickupDate: asDateOnly(parsed.data.pickupDate),
    vehicleType: parsed.data.vehicleType,
    status: "requested",
    estimatedCost: vehicleCosts[parsed.data.vehicleType] ?? 2400,
  }).returning();

  res.status(201).json(CreateTransportRequestResponse.parse(request));
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [listings, buyers] = await Promise.all([
    db.select().from(listingsTable),
    db.select().from(buyersTable),
  ]);
  const available = listings.filter((listing) => listing.status === "available");
  const totalLift = available.reduce((sum, listing) => {
    const lift = listing.marketPrice > 0
      ? ((listing.askingPrice - listing.marketPrice) / listing.marketPrice) * 100
      : 0;
    return sum + lift;
  }, 0);
  const averagePriceLift = available.length > 0 ? Number((totalLift / available.length).toFixed(1)) : 0;
  const fairTradeValue = available.reduce((sum, listing) => sum + listing.askingPrice * listing.quantity, 0);

  res.json(GetDashboardSummaryResponse.parse({
    farmersConnected: 12480 + listings.length,
    fairTradeValue: Number((1860000 + fairTradeValue).toFixed(0)),
    availableLots: available.length,
    verifiedBuyers: buyers.filter((buyer) => buyer.verified).length,
    averagePriceLift,
  }));
});

export default router;