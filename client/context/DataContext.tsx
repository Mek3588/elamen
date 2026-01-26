import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, Order, OrderStatus, OrderItem, Worker } from "@/types";

const PRODUCTS_KEY = "@elamen_products";
const ORDERS_KEY = "@elamen_orders";
const WORKERS_KEY = "@elamen_workers";

const SAMPLE_PRODUCTS: Product[] = [
  { id: "1", name: "Tibs", price: 250, category: "Mains", available: true, description: "Sauteed beef with onions and peppers" },
  { id: "2", name: "Doro Wat", price: 300, category: "Mains", available: true, description: "Spicy chicken stew with egg" },
  { id: "3", name: "Kitfo", price: 280, category: "Mains", available: true, description: "Ethiopian beef tartare" },
  { id: "4", name: "Shiro", price: 120, category: "Vegetarian", available: true, description: "Chickpea stew" },
  { id: "5", name: "Beyaynet", price: 150, category: "Vegetarian", available: true, description: "Fasting platter" },
  { id: "6", name: "Burger", price: 180, category: "Fast Food", available: true, description: "Classic beef burger" },
  { id: "7", name: "Pizza", price: 220, category: "Fast Food", available: true, description: "Mixed pizza" },
  { id: "8", name: "Juice", price: 50, category: "Drinks", available: true, description: "Fresh fruit juice" },
];

interface DataContextType {
  products: Product[];
  orders: Order[];
  workers: Worker[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createOrder: (items: Omit<OrderItem, "id">[], tableNumber?: number, notes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, workerId?: string, workerName?: string) => Promise<void>;
  addOrderNotes: (orderId: string, notes: string) => Promise<void>;
  addWorker: (username: string, password: string) => Promise<Worker>;
  deleteWorker: (id: string) => Promise<void>;
  getOrdersByDate: (startDate: Date, endDate: Date) => Order[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [storedProducts, storedOrders, storedWorkers] = await Promise.all([
        AsyncStorage.getItem(PRODUCTS_KEY),
        AsyncStorage.getItem(ORDERS_KEY),
        AsyncStorage.getItem(WORKERS_KEY),
      ]);

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(SAMPLE_PRODUCTS);
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(SAMPLE_PRODUCTS));
      }

      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }

      if (storedWorkers) {
        setWorkers(JSON.parse(storedWorkers));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setProducts(SAMPLE_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = async () => {
    setIsLoading(true);
    await loadData();
  };

  const addProduct = async (productData: Omit<Product, "id">): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setProducts(updatedProducts);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id);
    setProducts(updatedProducts);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
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

    const newOrder: Order = {
      id: Date.now().toString(),
      items: orderItems,
      status: "pending",
      totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tableNumber,
      notes,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    workerId?: string,
    workerName?: string
  ) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status,
            workerId: workerId || o.workerId,
            workerName: workerName || o.workerName,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    setOrders(updatedOrders);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  };

  const addOrderNotes = async (orderId: string, notes: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? { ...o, notes, updatedAt: new Date().toISOString() }
        : o
    );
    setOrders(updatedOrders);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  };

  const addWorker = async (username: string, password: string): Promise<Worker> => {
    const newWorker: Worker = {
      id: Date.now().toString(),
      username,
      password,
      createdAt: new Date().toISOString(),
      active: true,
    };
    const updatedWorkers = [...workers, newWorker];
    setWorkers(updatedWorkers);
    await AsyncStorage.setItem(WORKERS_KEY, JSON.stringify(updatedWorkers));
    return newWorker;
  };

  const deleteWorker = async (id: string) => {
    const updatedWorkers = workers.filter((w) => w.id !== id);
    setWorkers(updatedWorkers);
    await AsyncStorage.setItem(WORKERS_KEY, JSON.stringify(updatedWorkers));
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
        addWorker,
        deleteWorker,
        getOrdersByDate,
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
