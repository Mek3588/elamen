import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertWorkerSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Workers API
  app.get("/api/workers", async (_req: Request, res: Response) => {
    try {
      const workers = await storage.getAllWorkers();
      res.json(workers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ error: "Failed to fetch workers" });
    }
  });

  app.post("/api/workers", async (req: Request, res: Response) => {
    try {
      const parsed = insertWorkerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const existingWorker = await storage.getWorkerByUsername(parsed.data.username);
      if (existingWorker) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const worker = await storage.createWorker(parsed.data);
      res.status(201).json(worker);
    } catch (error) {
      console.error("Error creating worker:", error);
      res.status(500).json({ error: "Failed to create worker" });
    }
  });

  app.post("/api/workers/login", async (req: Request, res: Response) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !role) {
        return res.status(400).json({ error: "Username and role are required" });
      }

      // For managers, just check role
      if (role === "manager") {
        return res.json({ 
          id: "manager-" + Date.now(), 
          username, 
          role: "manager",
          active: true,
          createdAt: new Date().toISOString()
        });
      }

      // For workers, check if user exists or create new one
      let worker = await storage.getWorkerByUsername(username);
      
      if (!worker) {
        // Auto-create worker on first login
        worker = await storage.createWorker({ 
          username, 
          password: password || "default", 
          role: "worker" 
        });
      }

      res.json(worker);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.delete("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteWorker(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting worker:", error);
      res.status(500).json({ error: "Failed to delete worker" });
    }
  });

  // Products API
  app.get("/api/products", async (_req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders API
  app.get("/api/orders", async (_req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/range/:start/:end", async (req: Request, res: Response) => {
    try {
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      const orders = await storage.getOrdersByDateRange(startDate, endDate);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders by date range:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const parsed = insertOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const order = await storage.createOrder(parsed.data);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const { status, workerId, workerName } = req.body;
      const order = await storage.updateOrder(req.params.id, { 
        status, 
        workerId, 
        workerName 
      });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.delete("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Seed initial products if empty
  app.post("/api/seed", async (_req: Request, res: Response) => {
    try {
      const existingProducts = await storage.getAllProducts();
      if (existingProducts.length > 0) {
        return res.json({ message: "Database already has products", count: existingProducts.length });
      }

      const sampleProducts = [
        { name: "Tibs", price: 250, category: "Mains", available: true, description: "Sauteed beef with onions and peppers" },
        { name: "Doro Wat", price: 300, category: "Mains", available: true, description: "Spicy chicken stew with egg" },
        { name: "Kitfo", price: 280, category: "Mains", available: true, description: "Ethiopian beef tartare" },
        { name: "Shiro", price: 120, category: "Vegetarian", available: true, description: "Chickpea stew" },
        { name: "Beyaynet", price: 150, category: "Vegetarian", available: true, description: "Fasting platter" },
        { name: "Burger", price: 180, category: "Fast Food", available: true, description: "Classic beef burger" },
        { name: "Pizza", price: 220, category: "Fast Food", available: true, description: "Mixed pizza" },
        { name: "Juice", price: 50, category: "Drinks", available: true, description: "Fresh fruit juice" },
      ];

      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }

      res.json({ message: "Seeded database with sample products", count: sampleProducts.length });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
