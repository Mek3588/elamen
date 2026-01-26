import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, Order, OrderStatus, OrderItem } from "@/types";

const PRODUCTS_KEY = "@restaurant_products";
const ORDERS_KEY = "@restaurant_orders";

const SAMPLE_PRODUCTS: Product[] = [
  { id: "1", name: "Margherita Pizza", price: 12.99, category: "Pizza", available: true, description: "Fresh tomatoes, mozzarella, basil" },
  { id: "2", name: "Pepperoni Pizza", price: 14.99, category: "Pizza", available: true, description: "Classic pepperoni with cheese" },
  { id: "3", name: "Caesar Salad", price: 8.99, category: "Salads", available: true, description: "Romaine, croutons, parmesan" },
  { id: "4", name: "Grilled Chicken", price: 16.99, category: "Mains", available: true, description: "Herb-marinated chicken breast" },
  { id: "5", name: "Pasta Carbonara", price: 13.99, category: "Pasta", available: true, description: "Creamy bacon pasta" },
  { id: "6", name: "Fish & Chips", price: 15.99, category: "Mains", available: false, description: "Beer-battered cod with fries" },
  { id: "7", name: "Tiramisu", price: 7.99, category: "Desserts", available: true, description: "Classic Italian dessert" },
  { id: "8", name: "Lemonade", price: 3.99, category: "Drinks", available: true, description: "Fresh squeezed lemonade" },
];

interface DataContextType {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createOrder: (items: Omit<OrderItem, "id">[], tableNumber?: number, notes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, workerId?: string, workerName?: string) => Promise<void>;
  addOrderNotes: (orderId: string, notes: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [storedProducts, storedOrders] = await Promise.all([
        AsyncStorage.getItem(PRODUCTS_KEY),
        AsyncStorage.getItem(ORDERS_KEY),
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

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        isLoading,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        addOrderNotes,
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
