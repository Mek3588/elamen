export type UserRole = "worker" | "manager";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt?: string;
}

export interface Worker {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  active: boolean;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  description?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  workerId?: string;
  workerName?: string;
  notes?: string;
  tableNumber?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
