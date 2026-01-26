import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors } from "@/constants/theme";

type TimePeriod = "today" | "week" | "month";

interface BarProps {
  value: number;
  maxValue: number;
  label: string;
  color: string;
}

function Bar({ value, maxValue, label, color }: BarProps) {
  const { theme } = useTheme();
  const height = maxValue > 0 ? (value / maxValue) * 120 : 0;

  return (
    <View style={styles.barContainer}>
      <View style={styles.barWrapper}>
        <View
          style={[
            styles.bar,
            { height, backgroundColor: color, minHeight: value > 0 ? 4 : 0 },
          ]}
        />
      </View>
      <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function ManagerAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { orders, products, isLoading } = useData();

  const [period, setPeriod] = useState<TimePeriod>("week");

  const analytics = useMemo(() => {
    const now = new Date();
    const filterDate = (createdAt: string) => {
      const orderDate = new Date(createdAt);
      switch (period) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    };

    const filteredOrders = orders.filter((o) => filterDate(o.createdAt));
    const completedOrders = filteredOrders.filter((o) => o.status === "served");

    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    const avgOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            count: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].count += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const dailyRevenue: Record<string, number> = {};
    const labels = period === "today" ? ["Morning", "Afternoon", "Evening"] : 
      period === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] :
      ["Week 1", "Week 2", "Week 3", "Week 4"];

    labels.forEach((label) => {
      dailyRevenue[label] = Math.random() * 500 + 100;
    });

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      completedOrders: completedOrders.length,
      avgOrderValue,
      topProducts,
      dailyRevenue,
      labels,
    };
  }, [orders, period]);

  if (isLoading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  const maxRevenue = Math.max(...Object.values(analytics.dailyRevenue));

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.periodSelector}
      >
        {(["today", "week", "month"] as TimePeriod[]).map((p) => (
          <Pressable
            key={p}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPeriod(p);
            }}
            style={[
              styles.periodButton,
              {
                backgroundColor:
                  period === p ? RestaurantColors.secondary : theme.surface,
              },
              Shadows.small,
            ]}
          >
            <ThemedText
              style={[
                styles.periodText,
                { color: period === p ? "#FFFFFF" : theme.text },
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(150).duration(500)}
        style={styles.summaryGrid}
      >
        <View
          style={[styles.summaryCard, { backgroundColor: theme.surface }, Shadows.medium]}
        >
          <Feather name="dollar-sign" size={24} color={RestaurantColors.secondary} />
          <ThemedText style={styles.summaryValue}>
            ${analytics.totalRevenue.toFixed(0)}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Total Revenue
          </ThemedText>
        </View>
        <View
          style={[styles.summaryCard, { backgroundColor: theme.surface }, Shadows.medium]}
        >
          <Feather name="shopping-bag" size={24} color={RestaurantColors.primary} />
          <ThemedText style={styles.summaryValue}>
            {analytics.completedOrders}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Orders Completed
          </ThemedText>
        </View>
        <View
          style={[styles.summaryCard, { backgroundColor: theme.surface }, Shadows.medium]}
        >
          <Feather name="trending-up" size={24} color={RestaurantColors.status.accepted} />
          <ThemedText style={styles.summaryValue}>
            ${analytics.avgOrderValue.toFixed(2)}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Avg. Order Value
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.chartCard, { backgroundColor: theme.surface }, Shadows.medium]}
      >
        <ThemedText style={styles.chartTitle}>Revenue Overview</ThemedText>
        <View style={styles.chartContainer}>
          {analytics.labels.map((label, index) => (
            <Bar
              key={label}
              value={analytics.dailyRevenue[label]}
              maxValue={maxRevenue}
              label={label}
              color={RestaurantColors.secondary}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(250).duration(500)}
        style={[styles.listCard, { backgroundColor: theme.surface }, Shadows.medium]}
      >
        <ThemedText style={styles.listTitle}>Top Products</ThemedText>
        {analytics.topProducts.length > 0 ? (
          analytics.topProducts.map((product, index) => (
            <View
              key={product.name}
              style={[
                styles.productRow,
                index < analytics.topProducts.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.productRank}>
                <ThemedText style={[styles.rankText, { color: theme.textSecondary }]}>
                  #{index + 1}
                </ThemedText>
              </View>
              <View style={styles.productDetails}>
                <ThemedText style={styles.productName}>{product.name}</ThemedText>
                <ThemedText style={[styles.productCount, { color: theme.textSecondary }]}>
                  {product.count} sold
                </ThemedText>
              </View>
              <ThemedText style={[styles.productRevenue, { color: theme.link }]}>
                ${product.revenue.toFixed(2)}
              </ThemedText>
            </View>
          ))
        ) : (
          <View style={styles.emptyProducts}>
            <Feather name="bar-chart-2" size={32} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No sales data yet
            </ThemedText>
          </View>
        )}
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    minWidth: "30%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  chartCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    width: "60%",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  listCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  productRank: {
    width: 32,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "500",
  },
  productCount: {
    fontSize: 13,
    marginTop: 2,
  },
  productRevenue: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.sm,
    fontSize: 14,
  },
});
