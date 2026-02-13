# Salescout Client API — Frontend Integration Guide

## Quick Start

### 1. Start the API server

```bash
cd /home/adil/repos/salescout/birbot-client-api
npm run build
node dist/main.js
```

Server runs on **`http://localhost:8081`** (dev) or **`http://localhost:30080`** (prod).  
All endpoints are prefixed with `/api`.  
Swagger docs available at `http://localhost:8081/swagger` (dev only).

**LAN access (other devices on same WiFi):**  
Use your machine's local IP instead of `localhost`:  
```
http://192.168.0.106:8081/api
```
> To find your current IP: `hostname -I | awk '{print $1}'`

### 2. Test credentials

| Login | Password |
|-------|----------|
| `test` | `123456` |

### 3. Full test flow

1. **Login** → get JWT token
2. **Add test store** → `POST /api/store/test` (creates store + 8 demo products)
3. **Get stores** → `GET /api/store`
4. **Get products** → `POST /api/product/:storeId?filter=all`

---

## Authentication

All protected endpoints require a **Bearer token** in the `Authorization` header.

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test",
  "password": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Using the token

Add this header to all subsequent requests:

```
Authorization: Bearer <access_token>
```

### Frontend example (axios)

```js
import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Step 1: Login
const { data } = await axios.post(`${API_URL}/auth/login`, {
  email: 'test',
  password: '123456',
});
const token = data.access_token;

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${token}` },
});

// Step 2: Add test store (only needed once, creates store + 8 demo products)
await api.post('/store/test');

// Step 3: Get stores
const { data: stores } = await api.get('/store');
const storeId = stores[0]._id;

// Step 4: Get products
const { data: products } = await api.post(`/product/${storeId}?filter=all&page=1&limit=20`);
```

### Frontend example (fetch)

```js
const API_URL = 'http://localhost:8081/api';

// Step 1: Login
const loginRes = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test', password: '123456' }),
});
const { access_token } = await loginRes.json();
const headers = { Authorization: `Bearer ${access_token}` };

// Step 2: Add test store (only needed once)
await fetch(`${API_URL}/store/test`, { method: 'POST', headers });

// Step 3: Get stores
const stores = await (await fetch(`${API_URL}/store`, { headers })).json();
const storeId = stores[0]._id;

// Step 4: Get products
const products = await (await fetch(`${API_URL}/product/${storeId}?filter=all&page=1&limit=20`, {
  method: 'POST', headers,
})).json();
```

---

## Core Endpoints

### Stores

#### Add test store (creates store + 8 demo products)

```
POST /api/store/test
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Тестовый магазин создан",
  "storeId": "...",
  "storeName": "Demo Kaspi Store",
  "productsCount": 8
}
```

> Call this once after login. Returns error if user already has a store.

#### Get all stores for current user

```
GET /api/store
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "698f41a08f6ad2780d8de667",
    "expireDate": "2027-01-01T00:00:00.000Z",
    "login": "",
    "name": "Demo Kaspi Store",
    "isStarted": true,
    "privilege": false,
    "whatsappExpireDate": null
  }
]
```

#### Get single store details

```
GET /api/store/:storeId
Authorization: Bearer <token>
```

---

### Products

#### Get product statistics (counts by status)

```
GET /api/product/:storeId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "all": 7,
  "first": 0,
  "inChanging": 0,
  "minPriceAchieved": 0,
  "inMinus": 0,
  "dempOff": 3,
  "archive": 1,
  "dempOn": 4,
  "noCompetitors": 0,
  "waiting": 0,
  "newProducts": 7,
  "preOrder": 0
}
```

#### Get product list (paginated)

```
POST /api/product/:storeId?filter=all&page=1&limit=20
Authorization: Bearer <token>
```

**Query parameters:**

| Param    | Type   | Description |
|----------|--------|-------------|
| `filter` | string | `all`, `dempOn`, `dempOff`, `archive`, `first`, `inChanging`, `minPriceAchieved`, `inMinus`, `noCompetitors`, `newProducts`, `preOrder` |
| `page`   | number | Page number (1-indexed) |
| `limit`  | number | Items per page (default 20) |
| `q`      | string | Search query (product name) |
| `sortBy` | string | Sort field |

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "name": "Apple iPhone 15 Pro Max 256GB",
      "price": 699990,
      "availableMinPrice": 594991,
      "availableMaxPrice": 804988,
      "img": "",
      "dempingPrice": 1,
      "isAutoRaise": true,
      "place": 3,
      "masterProductSku": "DEMO-002",
      "purchasePrice": 600000,
      "sku": "DEMO-002",
      "isActive": true,
      "isDemping": false,
      "url": "https://kaspi.kz/shop/p/DEMO-002",
      "loanPeriod": 24,
      "bonus": 5,
      "minBonus": 5,
      "maxBonus": 60,
      "isBonusDemping": false,
      "margin": 0
    }
  ]
}
```

#### Get single product

```
GET /api/product/product-by-id/:productId
Authorization: Bearer <token>
```

#### Update product

```
PATCH /api/product/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 549990,
  "availableMinPrice": 500000,
  "availableMaxPrice": 600000,
  "isDemping": true,
  "dempingPrice": 100,
  "isAutoRaise": true,
  "bonus": 10
}
```

---

### User Profile

#### Get profile info

```
GET /api/profile
Authorization: Bearer <token>
```

---

## CORS

The API allows all origins (`Access-Control-Allow-Origin: *`), so you can call it from any frontend dev server (e.g., `localhost:3000`, `localhost:5173`).

---

## Environment Variables (.env)

```env
MAIN_MONGO_CONNECT_URL=mongodb://127.0.0.1:27017/salescout
REDIS_URL=redis://127.0.0.1:6379
TECH_REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=salescout-dev-secret-key-2026
ENVIRONMENT=dev
```

Both MongoDB and Redis must be running for the API to start.

---

## Demo Products (created by POST /api/store/test)

| SKU | Name | Price (₸) | Category | Demping |
|-----|------|-----------|----------|---------|
| DEMO-001 | Samsung Galaxy S24 Ultra 256GB | 549,990 | Смартфоны | ✅ |
| DEMO-002 | Apple iPhone 15 Pro Max 256GB | 699,990 | Смартфоны | ❌ |
| DEMO-003 | Xiaomi 14 Ultra 512GB | 399,990 | Смартфоны | ✅ |
| DEMO-004 | Sony WH-1000XM5 Наушники | 149,990 | Наушники | ❌ |
| DEMO-005 | MacBook Air M3 15 256GB | 599,990 | Ноутбуки | ❌ (archived) |
| DEMO-006 | Samsung Galaxy Watch 6 Classic | 179,990 | Умные часы | ✅ |
| DEMO-007 | Apple AirPods Pro 2 | 119,990 | Наушники | ✅ |
| DEMO-008 | Dyson V15 Detect | 349,990 | Пылесосы | ❌ |

Product fields of interest:
- **price** — current selling price (in tenge, no decimals)
- **purchasePrice** — cost price
- **isDemping** — auto-price-reduction enabled
- **isActive** — product is live (false = archived)
- **place** — current position in marketplace
- **amount** — stock quantity
- **availableMinPrice / availableMaxPrice** — price bounds for auto-pricing
