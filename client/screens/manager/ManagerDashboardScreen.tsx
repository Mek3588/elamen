import React, { useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OrderCard } from "@/components/OrderCard";
import { ThemedText } from "@/components/ThemedText";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors } from "@/constants/theme";
import { Order } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}

function StatCard({ icon, label, value, color, delay }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      style={[styles.statCard, { backgroundColor: theme.surface }, Shadows.medium]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
    </Animated.View>
  );
}

export default function ManagerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { orders, products, isLoading, refreshData } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) =>
      ["pending", "accepted", "preparing", "ready"].includes(o.status)
    ).length;
    
    const todayRevenue = orders
      .filter((o) => {
        const orderDate = new Date(o.createdAt).toDateString();
        const today = new Date().toDateString();
        return orderDate === today && o.status === "served";
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const availableProducts = products.filter((p) => p.available).length;

    return {
      activeOrders,
      todayRevenue,
      availableProducts,
      totalOrders: orders.length,
    };
  }, [orders, products]);

  const recentOrders = useMemo(() => {
    return orders
      .filter((o) => ["pending", "accepted", "preparing", "ready"].includes(o.status))
      .slice(0, 5);
  }, [orders]);

  const handleOrderPress = (order: Order) => {
    navigation.navigate("OrderDetail", { orderId: order.id });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={recentOrders}
      keyExtractor={(item) => item.id}
      refreshing={false}
      onRefresh={refreshData}
      ListHeaderComponent={
        <View>
          <Animated.View
            entering={FadeInDown.delay(50).duration(500)}
            style={styles.welcomeSection}
          >
            <ThemedText style={styles.welcomeText}>Welcome back!</ThemedText>
            <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </ThemedText>
          </Animated.View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="activity"
              label="Active Orders"
              value={stats.activeOrders}
              color={RestaurantColors.primary}
              delay={100}
            />
            <StatCard
              icon="dollar-sign"
              label="Today's Revenue"
              value={`$${stats.todayRevenue.toFixed(0)}`}
              color={RestaurantColors.secondary}
              delay={150}
            />
            <StatCard
              icon="package"
              label="Available Items"
              value={stats.availableProducts}
              color={RestaurantColors.status.accepted}
              delay={200}
            />
            <StatCard
              icon="clipboard"
              label="Total Orders"
              value={stats.totalOrders}
              color={RestaurantColors.status.pending}
              delay={250}
            />
          </View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.sectionHeader}
          >
            <ThemedText style={styles.sectionTitle}>Active Orders</ThemedText>
            <Pressable onPress={() => navigation.navigate("ManagerOrdersTab")}>
              <ThemedText style={[styles.viewAll, { color: theme.link }]}>
                View All
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      }
      ListEmptyComponent={
        <Animated.View
          entering={FadeInDown.delay(350).duration(500)}
          style={[styles.emptyCard, { backgroundColor: theme.surface }, Shadows.small]}
        >
          <Feather name="check-circle" size={40} color={theme.success} />
          <ThemedText style={styles.emptyTitle}>All Caught Up!</ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            No active orders at the moment
          </ThemedText>
        </Animated.View>
      }
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(350 + index * 50).duration(400)}>
          <OrderCard
            order={item}
            onPress={() => handleOrderPress(item)}
            showWorker
          />
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    marginBottom: Spacing.xl,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  dateText: {
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "48%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexGrow: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
