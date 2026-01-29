import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertWorkerSchema } from "@shared/schema";
import { upload } from "./cloudinary";

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

      // For managers, check if a worker with role "manager" exists
      if (role === "manager") {
        let worker = await storage.getWorkerByUsername(username);
        if (!worker || worker.role !== "manager") {
          return res.status(401).json({ error: "Invalid manager credentials" });
        }
        // Optionally verify password (plaintext for now)
        if (worker.password !== password) {
          return res.status(401).json({ error: "Invalid password" });
        }
        return res.json(worker);
      }

      // For workers, check if user exists
      let worker = await storage.getWorkerByUsername(username);
      if (!worker) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      // Verify password
      if (worker.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      res.json(worker);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.delete("/api/workers/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteWorker(req.params.id as string);
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
      const product = await storage.getProduct(req.params.id as string);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const { name, price, category, description, available } = req.body;
      const imageUrl = (req.file as any)?.path || null;

      const productData = {
        name: name?.trim(),
        price: parseFloat(price),
        category,
        description: description?.trim(),
        available: available === "true" || available === true,
        imageUrl,
      };

      const parsed = insertProductSchema.safeParse(productData);
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

  app.put("/api/products/:id", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const { name, price, category, description, available } = req.body;
      const imageUrl = (req.file as any)?.path || undefined;

      const updateData: any = {
        name: name?.trim(),
        price: price ? parseFloat(price) : undefined,
        category,
        description: description?.trim(),
        available: available === "true" || available === true,
      };
      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
      }

      const product = await storage.updateProduct(req.params.id as string, updateData);
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
      await storage.deleteProduct(req.params.id as string);
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
      const order = await storage.getOrder(req.params.id as string);
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
      const startDate = new Date(req.params.start as string);
      const endDate = new Date(req.params.end as string);
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
      const order = await storage.updateOrder(req.params.id as string, req.body);
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
      const order = await storage.updateOrder(req.params.id as string, {
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
      await storage.deleteOrder(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (_req: Request, res: Response) => {
    try {
      const timestamp = new Date().toISOString();
      const randomText = Math.random().toString(36).substring(7);
      res.json({
        status: "ok",
        timestamp,
        randomText,
        message: "Server is alive and healthy"
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ error: "Health check failed" });
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
