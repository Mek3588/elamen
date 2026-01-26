import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Workers table (kitchen staff)
export const workers = pgTable("workers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("worker"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkerSchema = createInsertSchema(workers).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Order items type for JSONB storage
export const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  price: z.number(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: real("total_amount").notNull(),
  tableNumber: integer("table_number"),
  notes: text("notes"),
  workerId: varchar("worker_id"),
  workerName: text("worker_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Relations
export const workersRelations = relations(workers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  worker: one(workers, {
    fields: [orders.workerId],
    references: [workers.id],
  }),
}));
