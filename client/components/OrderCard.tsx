import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, CURRENCY } from "@/constants/theme";
import { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  showWorker?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  if (isToday) {
    return `Today, ${time}`;
  }
  
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${dateStr}, ${time}`;
}

export function OrderCard({ order, onPress, showWorker = false }: OrderCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getStatusColor = () => {
    switch (order.status) {
      case "pending":
        return theme.pending;
      case "completed":
        return theme.completed;
      default:
        return theme.pending;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.surface },
        Shadows.medium,
        animatedStyle,
      ]}
    >
      <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <ThemedText style={styles.orderId}>
              Order #{order.id.slice(-4)}
            </ThemedText>
            {order.tableNumber ? (
              <View style={[styles.tableBadge, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText style={[styles.tableText, { color: theme.textSecondary }]}>
                  Table {order.tableNumber}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <StatusBadge status={order.status} size="small" />
        </View>

        <View style={styles.itemsList}>
          {order.items.slice(0, 3).map((item) => (
            <ThemedText
              key={item.id}
              style={[styles.itemText, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {item.quantity}x {item.productName}
            </ThemedText>
          ))}
          {order.items.length > 3 ? (
            <ThemedText style={[styles.moreItems, { color: theme.link }]}>
              +{order.items.length - 3} more items
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Feather name="clock" size={12} color={theme.textSecondary} />
            <ThemedText style={[styles.time, { color: theme.textSecondary }]}>
              {formatDateTime(order.createdAt)}
            </ThemedText>
            {showWorker && order.workerName ? (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <Feather name="user" size={12} color={theme.textSecondary} />
                <ThemedText style={[styles.worker, { color: theme.textSecondary }]}>
                  {order.workerName}
                </ThemedText>
              </>
            ) : null}
          </View>
          <ThemedText style={[styles.total, { color: theme.link }]}>
            {CURRENCY} {order.totalAmount.toFixed(2)}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
    flexDirection: "row",
  },
  statusBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
  },
  tableBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  tableText: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemsList: {
    marginBottom: Spacing.sm,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreItems: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  time: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 12,
    marginHorizontal: Spacing.xs,
  },
  worker: {
    fontSize: 12,
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
  },
});
