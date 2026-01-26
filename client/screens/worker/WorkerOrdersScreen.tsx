import React, { useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OrderCard } from "@/components/OrderCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { Order } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type FilterType = "orders" | "completed";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "orders", label: "Orders" },
  { key: "completed", label: "Completed" },
];

export default function WorkerOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { orders, isLoading, updateOrderStatus, refreshData } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>("orders");
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      switch (activeFilter) {
        case "orders":
          return order.status === "pending";
        case "completed":
          return order.status === "completed";
        default:
          return true;
      }
    });
  }, [orders, activeFilter]);

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
                          activeFilter === filter.key
                            ? "#FFFFFF"
                            : theme.text,
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
                : "Completed orders will appear here"
            }
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <OrderCard order={item} onPress={() => handleOrderPress(item)} />
            {activeFilter === "orders" && item.status === "pending" ? (
              <Pressable
                onPress={() => handleCompleteOrder(item)}
                style={({ pressed }) => [
                  styles.completeButton,
                  { backgroundColor: theme.completed, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ThemedText style={styles.completeButtonText}>
                  Mark as Completed
                </ThemedText>
              </Pressable>
            ) : null}
          </Animated.View>
        )}
      />
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
  completeButton: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
