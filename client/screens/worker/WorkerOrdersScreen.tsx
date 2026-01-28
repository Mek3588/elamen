import React, { useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OrderCard } from "@/components/OrderCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  BorderRadius,
  Spacing,
  Shadows,
  RestaurantColors,
} from "@/constants/theme";
import { Order } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type FilterType = "orders" | "completed";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "orders", label: "Orders" },
  { key: "completed", label: "Completed" },
];

type DateFilterType = "today" | "week" | "month" | "all";

const DATE_FILTERS: { key: DateFilterType; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

function getDateRange(filter: DateFilterType): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );
  let start: Date;

  switch (filter) {
    case "today":
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      );
      break;
    case "week":
      const dayOfWeek = now.getDay();
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - dayOfWeek,
        0,
        0,
        0,
      );
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      break;
    case "all":
    default:
      start = new Date(0);
      break;
  }

  return { start, end };
}

export default function WorkerOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { orders, isLoading, updateOrderStatus, deleteOrder, refreshData } =
    useData();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [activeFilter, setActiveFilter] = useState<FilterType>("orders");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("today");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      switch (activeFilter) {
        case "orders":
          return order.status === "pending";
        case "completed":
          return order.status === "completed";
        default:
          return true;
      }
    });

    if (activeFilter === "completed") {
      const { start, end } = getDateRange(dateFilter);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }

    return filtered;
  }, [orders, activeFilter, dateFilter]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === "pending").length;
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate("OrderDetail", { orderId: order.id });
  };

  const handleCompleteOrder = async (order: Order) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateOrderStatus(order.id, "completed", user?.id, user?.username);
  };

  const handleDeletePress = (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOrderToDelete(order);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await deleteOrder(orderToDelete.id);
      setDeleteModalVisible(false);
      setOrderToDelete(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.filterRow}>
              {FILTERS.map((filter) => (
                <Pressable
                  key={filter.key}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveFilter(filter.key);
                  }}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        activeFilter === filter.key
                          ? theme.link
                          : theme.surface,
                    },
                    Shadows.small,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.filterText,
                      {
                        color:
                          activeFilter === filter.key ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    {filter.label}
                  </ThemedText>
                  {filter.key === "orders" && pendingCount > 0 ? (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            activeFilter === filter.key
                              ? "rgba(255,255,255,0.3)"
                              : theme.pending,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.badgeText,
                          {
                            color: "#FFFFFF",
                          },
                        ]}
                      >
                        {pendingCount}
                      </ThemedText>
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </View>

            {activeFilter === "completed" ? (
              <View style={styles.dateFilterRow}>
                {DATE_FILTERS.map((filter) => (
                  <Pressable
                    key={filter.key}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDateFilter(filter.key);
                    }}
                    style={[
                      styles.dateFilterButton,
                      {
                        backgroundColor:
                          dateFilter === filter.key
                            ? RestaurantColors.secondary
                            : "transparent",
                        borderColor:
                          dateFilter === filter.key
                            ? RestaurantColors.secondary
                            : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.dateFilterText,
                        {
                          color:
                            dateFilter === filter.key
                              ? "#FFFFFF"
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {filter.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            image={require("../../../assets/images/empty-orders.png")}
            title={
              activeFilter === "orders"
                ? "No pending orders"
                : "No completed orders"
            }
            description={
              activeFilter === "orders"
                ? "New orders will appear here"
                : activeFilter === "completed" && dateFilter !== "all"
                  ? `No orders completed ${dateFilter === "today" ? "today" : dateFilter === "week" ? "this week" : "this month"}`
                  : "Completed orders will appear here"
            }
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <OrderCard order={item} onPress={() => handleOrderPress(item)} />
            <View style={styles.actionRow}>
              {activeFilter === "orders" && item.status === "pending" ? (
                <Pressable
                  onPress={() => handleCompleteOrder(item)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.completeButton,
                    {
                      backgroundColor: theme.completed,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.actionButtonText}>
                    Complete
                  </ThemedText>
                </Pressable>
              ) : null}
              {/* <Pressable
                onPress={() => handleOrderPress(item)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.editButton,
                  { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Feather name="edit-2" size={16} color={theme.text} />
                <ThemedText style={[styles.actionButtonText, { color: theme.text }]}>
                  Edit
                </ThemedText>
              </Pressable> */}
              {item.status !== "completed" && (
                <Pressable
                  onPress={() => handleDeletePress(item)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.deleteButton,
                    {
                      backgroundColor: "rgba(214, 40, 40, 0.1)",
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Feather name="trash-2" size={16} color="#D62828" />
                  <ThemedText
                    style={[styles.actionButtonText, { color: "#D62828" }]}
                  >
                    Delete
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}
      />

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <View style={styles.modalIcon}>
              <Feather name="alert-triangle" size={32} color="#D62828" />
            </View>
            <ThemedText style={styles.modalTitle}>Delete Order?</ThemedText>
            <ThemedText
              style={[styles.modalMessage, { color: theme.textSecondary }]}
            >
              Are you sure you want to delete Order #
              {orderToDelete?.id.slice(-4)}? This action cannot be undone.
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <ThemedText
                  style={[styles.modalButtonText, { color: theme.text }]}
                >
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                style={[styles.modalButton, { backgroundColor: "#D62828" }]}
              >
                <ThemedText
                  style={[styles.modalButtonText, { color: "#FFFFFF" }]}
                >
                  Delete
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dateFilterRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    flexWrap: "wrap",
  },
  dateFilterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  dateFilterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  completeButton: {},
  editButton: {
    borderWidth: 1,
  },
  deleteButton: {},
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(214, 40, 40, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
