import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { getApiUrl } from "@/lib/query-client";
import { notificationService } from "@/services/NotificationService";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  tableNumber?: number | null;
  notes?: string | null;
  workerId?: string | null;
  workerName?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Worker {
  id: string;
  username: string;
  password: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface DataContextType {
  products: Product[];
  orders: Order[];
  workers: Worker[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createOrder: (items: Omit<OrderItem, "id">[], tableNumber?: number, notes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, workerId?: string, workerName?: string) => Promise<void>;
  addOrderNotes: (orderId: string, notes: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addWorker: (username: string, password: string) => Promise<Worker>;
  deleteWorker: (id: string) => Promise<void>;
  getOrdersByDate: (startDate: Date, endDate: Date) => Order[];
  setUserRole: (role: "worker" | "manager" | null) => void;
  initializeNotifications: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"worker" | "manager" | null>(null);
  const notificationsInitialized = useRef(false);
  const previousOrderCount = useRef<number>(0);

  const apiUrl = getApiUrl();

  const initializeNotifications = async () => {
    if (notificationsInitialized.current) return;
    const success = await notificationService.initialize();
    if (success) {
      notificationsInitialized.current = true;
      notificationService.setLastOrderCount(orders.filter(o => o.status === "pending").length);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(new URL("/api/products", apiUrl).toString());
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(new URL("/api/orders", apiUrl).toString());
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        
        if (userRole === "manager" && notificationsInitialized.current) {
          await notificationService.checkForNewOrders(data, true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch(new URL("/api/workers", apiUrl).toString());
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    }
  };

  const seedDatabase = async () => {
    try {
      await fetch(new URL("/api/seed", apiUrl).toString(), { method: "POST" });
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await seedDatabase();
      await Promise.all([fetchProducts(), fetchOrders(), fetchWorkers()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchProducts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    await Promise.all([fetchProducts(), fetchOrders(), fetchWorkers()]);
  };

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
    const response = await fetch(new URL("/api/products", apiUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create product");
    }
    
    const newProduct = await response.json();
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const response = await fetch(new URL(`/api/products/${id}`, apiUrl).toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update product");
    }
    
    const updatedProduct = await response.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch(new URL(`/api/products/${id}`, apiUrl).toString(), {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
    
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const createOrder = async (
    items: Omit<OrderItem, "id">[],
    tableNumber?: number,
    notes?: string
  ): Promise<Order> => {
    const orderItems: OrderItem[] = items.map((item, index) => ({
      ...item,
      id: `${Date.now()}-${index}`,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderData = {
      items: orderItems,
      status: "pending",
      totalAmount,
      tableNumber,
      notes,
    };

    const response = await fetch(new URL("/api/orders", apiUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create order");
    }
    
    const newOrder = await response.json();
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    workerId?: string,
    workerName?: string
  ) => {
    const response = await fetch(new URL(`/api/orders/${orderId}/status`, apiUrl).toString(), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, workerId, workerName }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update order status");
    }
    
    const updatedOrder = await response.json();
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
  };

  const addOrderNotes = async (orderId: string, notes: string) => {
    const response = await fetch(new URL(`/api/orders/${orderId}`, apiUrl).toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to add order notes");
    }
    
    const updatedOrder = await response.json();
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
  };

  const deleteOrder = async (orderId: string) => {
    const response = await fetch(new URL(`/api/orders/${orderId}`, apiUrl).toString(), {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete order");
    }
    
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const addWorker = async (username: string, password: string): Promise<Worker> => {
    const response = await fetch(new URL("/api/workers", apiUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: "worker" }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create worker");
    }
    
    const newWorker = await response.json();
    setWorkers((prev) => [newWorker, ...prev]);
    return newWorker;
  };

  const deleteWorker = async (id: string) => {
    const response = await fetch(new URL(`/api/workers/${id}`, apiUrl).toString(), {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete worker");
    }
    
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  const getOrdersByDate = (startDate: Date, endDate: Date): Order[] => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        workers,
        isLoading,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        addOrderNotes,
        deleteOrder,
        addWorker,
        deleteWorker,
        getOrdersByDate,
        setUserRole,
        initializeNotifications,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
