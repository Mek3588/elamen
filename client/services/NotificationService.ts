import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_ORDER_COUNT_KEY = "@elamen_last_order_count";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private lastOrderCount: number = 0;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("orders", {
          name: "Order Notifications",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#D4241B",
        });
      }

      const savedCount = await AsyncStorage.getItem(LAST_ORDER_COUNT_KEY);
      if (savedCount) {
        this.lastOrderCount = parseInt(savedCount, 10);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
      return false;
    }
  }

  async checkForNewOrders(currentOrders: any[], isManager: boolean): Promise<void> {
    if (!this.isInitialized || !isManager) return;

    const pendingOrders = currentOrders.filter(
      (order) => order.status === "pending"
    );
    const currentCount = pendingOrders.length;

    if (currentCount > this.lastOrderCount && this.lastOrderCount > 0) {
      const newOrdersCount = currentCount - this.lastOrderCount;
      await this.sendNewOrderNotification(newOrdersCount, pendingOrders[0]);
    }

    this.lastOrderCount = currentCount;
    await AsyncStorage.setItem(LAST_ORDER_COUNT_KEY, currentCount.toString());
  }

  async sendNewOrderNotification(count: number, latestOrder?: any): Promise<void> {
    try {
      const title = count === 1 ? "New Order Received!" : `${count} New Orders!`;
      const body = latestOrder
        ? `Order with ${latestOrder.items?.length || 0} item(s) - Br ${latestOrder.totalAmount?.toFixed(2) || "0.00"}`
        : "You have new orders waiting to be processed";

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: "new_order", orderId: latestOrder?.id },
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  async resetOrderCount(): Promise<void> {
    this.lastOrderCount = 0;
    await AsyncStorage.setItem(LAST_ORDER_COUNT_KEY, "0");
  }

  getLastOrderCount(): number {
    return this.lastOrderCount;
  }

  setLastOrderCount(count: number): void {
    this.lastOrderCount = count;
    AsyncStorage.setItem(LAST_ORDER_COUNT_KEY, count.toString());
  }
}

export const notificationService = NotificationService.getInstance();
