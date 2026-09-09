# Kisan Setu API

Base path: `/api`

The canonical contract lives in `lib/api-spec/openapi.yaml`. The frontend uses generated hooks from `@workspace/api-client-react`; the server validates requests and responses with `@workspace/api-zod`.

## Health

### `GET /healthz`

Returns:

```json
{ "status": "ok" }
```

## Listings

### `GET /market/listings`

Optional query parameters:

- `crop`
- `location`
- `status`: `available`, `reserved`, or `sold`

### `POST /market/listings`

```json
{
  "farmerName": "Suresh Patil",
  "crop": "Tomato",
  "quantity": 850,
  "unit": "kg",
  "askingPrice": 31.2,
  "marketPrice": 24,
  "location": "Nashik, Maharashtra",
  "harvestDate": "2026-09-14"
}
```

The server sets `status` to `available`, marks the new listing as verified for the prototype, and creates the timestamp.

### `GET /market/listings/:id`

Returns one listing or `404` if it does not exist.

### `PATCH /market/listings/:id`

Accepts any of:

```json
{
  "askingPrice": 32,
  "quantity": 900,
  "status": "reserved"
}
```

## Buyers

### `GET /market/buyers`

Returns verified buyer profiles with their location, crop interests, response time, and rating.

## Prices

### `GET /market/price-snapshot`

Returns current prototype price comparisons for each crop:

```json
{
  "crop": "Tomato",
  "localMandi": 24,
  "fairPrice": 28.5,
  "bestBuyerPrice": 31.2,
  "unit": "kg",
  "change": 8.2
}
```

## Transport

### `POST /market/transport-requests`

```json
{
  "listingId": 1,
  "pickupLocation": "Nashik, Maharashtra",
  "pickupDate": "2026-09-14",
  "vehicleType": "pickup"
}
```

Supported vehicle values from the frontend are `mini-truck`, `pickup`, and `lorry`. The API stores the request with status `requested` and calculates an estimated prototype cost.

## Dashboard

### `GET /dashboard/summary`

Returns:

```json
{
  "farmersConnected": 12484,
  "fairTradeValue": 1938210,
  "availableLots": 3,
  "verifiedBuyers": 3,
  "averagePriceLift": 27.7
}
```