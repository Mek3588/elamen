import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_ORDER_COUNT_KEY = "@elamen_last_order_count";
const LAST_COMPLETED_ORDER_COUNT_KEY = "@elamen_last_completed_order_count";
const NOTIFIED_COMPLETED_ORDER_IDS_KEY = "@elamen_notified_completed_order_ids";

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
  private lastCompletedOrderCount: number = 0;
  private notifiedCompletedOrderIds: Set<string> = new Set();
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
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
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

      const savedCompletedCount = await AsyncStorage.getItem(
        LAST_COMPLETED_ORDER_COUNT_KEY,
      );
      if (savedCompletedCount) {
        this.lastCompletedOrderCount = parseInt(savedCompletedCount, 10);
      }

      await this.loadNotifiedCompletedOrderIds();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize notifications:", error);
      return false;
    }
  }

  async checkForNewOrders(
    currentOrders: any[],
    isManager: boolean,
  ): Promise<void> {
    if (!this.isInitialized || !isManager) return;

    const pendingOrders = currentOrders.filter(
      (order) => order.status === "pending",
    );
    const currentCount = pendingOrders.length;

    if (currentCount > this.lastOrderCount && this.lastOrderCount > 0) {
      const newOrdersCount = currentCount - this.lastOrderCount;
      await this.sendNewOrderNotification(newOrdersCount, pendingOrders[0]);
    }

    this.lastOrderCount = currentCount;
    await AsyncStorage.setItem(LAST_ORDER_COUNT_KEY, currentCount.toString());
  }

  async sendNewOrderNotification(
    count: number,
    latestOrder?: any,
  ): Promise<void> {
    try {
      const title =
        count === 1 ? "New Order Received!" : `${count} New Orders!`;
      let body = "You have new orders waiting to be processed";
      if (latestOrder) {
        const itemCount = latestOrder.items?.length || 0;
        const total = latestOrder.totalAmount?.toFixed(2) || "0.00";
        // Build product list (max 3 items)
        const productNames = latestOrder.items?.slice(0, 3).map((item: any) => item.productName).join(", ");
        const moreText = itemCount > 3 ? ` and ${itemCount - 3} more` : "";
        body = `Order with ${itemCount} item(s): ${productNames}${moreText} - Br ${total}`;
      }

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

  // Completed order notifications
  private async loadNotifiedCompletedOrderIds(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(
        NOTIFIED_COMPLETED_ORDER_IDS_KEY,
      );
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        this.notifiedCompletedOrderIds = new Set(ids);
      }
    } catch (error) {
      console.error("Failed to load notified completed order IDs:", error);
    }
  }

  private async saveNotifiedCompletedOrderIds(): Promise<void> {
    try {
      const ids = Array.from(this.notifiedCompletedOrderIds);
      await AsyncStorage.setItem(
        NOTIFIED_COMPLETED_ORDER_IDS_KEY,
        JSON.stringify(ids),
      );
    } catch (error) {
      console.error("Failed to save notified completed order IDs:", error);
    }
  }

  async checkForCompletedOrders(
    currentOrders: any[],
    isManager: boolean,
  ): Promise<void> {
    if (!this.isInitialized || !isManager) return;

    const completedOrders = currentOrders.filter(
      (order) => order.status === "completed",
    );
    const currentCount = completedOrders.length;

    // Load notified IDs if not already loaded
    if (this.notifiedCompletedOrderIds.size === 0) {
      await this.loadNotifiedCompletedOrderIds();
    }

    // Find newly completed orders that haven't been notified
    const newCompletedOrders = completedOrders.filter(
      (order) => !this.notifiedCompletedOrderIds.has(order.id),
    );

    for (const order of newCompletedOrders) {
      await this.sendCompletedOrderNotification(order);
      this.notifiedCompletedOrderIds.add(order.id);
    }

    if (newCompletedOrders.length > 0) {
      await this.saveNotifiedCompletedOrderIds();
    }

    this.lastCompletedOrderCount = currentCount;
    await AsyncStorage.setItem(
      LAST_COMPLETED_ORDER_COUNT_KEY,
      currentCount.toString(),
    );
  }

  async sendCompletedOrderNotification(order: any): Promise<void> {
    try {
      const title = "Order Completed!";
      const itemCount = order.items?.length || 0;
      const total = order.totalAmount?.toFixed(2) || "0.00";
      // Build product list (max 3 items)
      const productNames = order.items?.slice(0, 3).map((item: any) => item.productName).join(", ");
      const moreText = itemCount > 3 ? ` and ${itemCount - 3} more` : "";
      const body = `Order #${order.id.slice(-4)} with ${itemCount} item(s): ${productNames}${moreText} - Br ${total}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: "completed_order", orderId: order.id },
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Failed to send completed order notification:", error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
