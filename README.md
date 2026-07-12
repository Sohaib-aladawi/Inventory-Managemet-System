# Vehicle Inventory Management System

A simple fleet inventory management module built to track warehouse stock movement between the store and field vehicles.

The system allows crews to take items from stock, record what is returned after completing a job, and automatically calculate usage.

---

## Features

### Inventory Management

* Create, edit, view and delete inventory items.
* Unique SKU/barcode validation.
* Track current stock quantities.
* Low stock indicators.

### Vehicle Management

* Create, edit and manage vehicles.
* Vehicle registration and type tracking.

### Trip Management

* Start trips by assigning items to a vehicle.
* Automatically reduce warehouse stock when items leave.
* Return trips and record unused items.
* Automatically restore returned stock quantities.
* Calculate item usage (`Taken - Returned`).

### Dashboard

* Current stock overview.
* Active trips currently in the field.
* Historical trip records.
* Low stock summary.

---

## Tech Stack

### Frontend

* Next.js 15 (App Router)
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Next.js Route Handlers
* Drizzle ORM

### Database

* Neon PostgreSQL

---

## Running Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Create a Neon database

1. Create a free account on Neon.
2. Create a new project.
3. Copy the connection string.

Example:

```text
postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

---

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_neon_connection_string
```

---

### 5. Create database tables

Generate migrations:

```bash
npx drizzle-kit generate
```

Push schema to Neon:

```bash
npx drizzle-kit push
```

---

### 6. Seed demo data

The project includes seed data containing:

* 20 inventory items
* 6 vehicles
* 3 trips

  * 2 completed trips
  * 1 active trip

Run:

```bash
npm run seed
```

---

### 7. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## API Routes

### Items

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/api/items`     |
| POST   | `/api/items`     |
| GET    | `/api/items/:id` |
| PATCH  | `/api/items/:id` |
| DELETE | `/api/items/:id` |

---

### Vehicles

| Method | Endpoint            |
| ------ | ------------------- |
| GET    | `/api/vehicles`     |
| POST   | `/api/vehicles`     |
| GET    | `/api/vehicles/:id` |
| PATCH  | `/api/vehicles/:id` |
| DELETE | `/api/vehicles/:id` |

---

### Trips

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | `/api/trips`         |
| GET    | `/api/trips/:id`     |
| GET    | `/api/trips/active`  |
| GET    | `/api/trips/history` |
| POST   | `/api/trips/start`   |
| POST   | `/api/trips/return`  |

---

### Dashboard

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/api/dashboard` |

---

## Project Structure

```text
src
├── app
│   ├── api
│   │   ├── dashboard
│   │   ├── items
│   │   ├── trips
│   │   └── vehicles
│   │
│   ├── dashboard
│   ├── stock
│   ├── trips
│   └── vehicles
│
├── components
│
├── db
│   ├── index.ts
│   ├── schema.ts
│   └── seed.ts
│
├── lib
│
└── types
```

---

## Database Structure

### Items

Tracks inventory stock levels.

### Vehicles

Stores vehicle information.

### Trips

Represents a vehicle leaving the warehouse.

### Trip Items

Tracks quantities taken and returned for reconciliation.

---

## Seed Data Included

### Inventory

* Networking equipment
* Installation materials
* Safety equipment
* Tools

### Vehicles

* Vans
* Pickup trucks
* Service vehicles

### Trips

* Completed trips
* Active trips
* Historical usage data

---

## Future Improvements

* Barcode scanner integration
* Trip attachments and photos
* User authentication and permissions
* Inventory audits
* Export reports to CSV/PDF

```
```
