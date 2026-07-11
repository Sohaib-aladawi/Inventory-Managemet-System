import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";


//  Items Table
export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),

  sku: varchar("sku", { length: 100 })
    .notNull()
    .unique(),

  name: varchar("name", { length: 255 })
    .notNull(),

  unit: varchar("unit", { length: 50 })
    .notNull(),

  quantity: integer("quantity")
    .notNull()
    .default(0),

  minimumStock: integer("minimum_stock")
    .notNull()
    .default(0),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});


// Vehicals Table
export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),

  registration: varchar("registration", { length: 100 })
    .notNull()
    .unique(),

  name: varchar("name", { length: 255 })
    .notNull(),

  type: varchar("type", { length: 100 })
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

// Trips Table

export const tripStatusEnum = pgEnum("trip_status", [
  "ACTIVE",
  "COMPLETED",
]);

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),

  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id, {
      onDelete: "restrict",
    })
    .notNull(),

  status: tripStatusEnum("status")
    .default("ACTIVE")
    .notNull(),

  departedAt: timestamp("departed_at")
    .defaultNow()
    .notNull(),

  returnedAt: timestamp("returned_at"),

  // Bonus feature
  jobReference: varchar("job_reference", {
    length: 255,
  }),

  notes: varchar("notes", {
    length: 1000,
  }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

// Trip Items table
export const tripItems = pgTable("trip_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  tripId: uuid("trip_id")
    .references(() => trips.id, {
      onDelete: "cascade",
    })
    .notNull(),

  itemId: uuid("item_id")
    .references(() => items.id, {
      onDelete: "restrict",
    })
    .notNull(),

  quantityTaken: integer("quantity_taken")
    .notNull(),

  quantityReturned: integer("quantity_returned")
    .notNull()
    .default(0),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


export type Items = typeof items.$inferSelect;
export type Vehicles = typeof vehicles.$inferSelect;
export type Trips = typeof trips.$inferSelect;