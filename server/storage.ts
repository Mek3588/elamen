import { 
  workers, products, orders,
  type Worker, type InsertWorker,
  type Product, type InsertProduct,
  type Order, type InsertOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export interface IStorage {
  // Workers
  getWorker(id: string): Promise<Worker | undefined>;
  getWorkerByUsername(username: string): Promise<Worker | undefined>;
  getAllWorkers(): Promise<Worker[]>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  deleteWorker(id: string): Promise<void>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Workers
  async getWorker(id: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker || undefined;
  }

  async getWorkerByUsername(username: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.username, username));
    return worker || undefined;
  }

  async getAllWorkers(): Promise<Worker[]> {
    return await db.select().from(workers).where(eq(workers.active, true)).orderBy(desc(workers.createdAt));
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const [worker] = await db.insert(workers).values(insertWorker).returning();
    return worker;
  }

  async deleteWorker(id: string): Promise<void> {
    await db.update(workers).set({ active: false }).where(eq(workers.id, id));
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(gte(orders.createdAt, startDate), lte(orders.createdAt, endDate)))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }
}

export const storage = new DatabaseStorage();
