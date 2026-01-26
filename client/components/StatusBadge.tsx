import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "small" | "medium";
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
};

export function StatusBadge({ status, size = "medium" }: StatusBadgeProps) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return theme.pending;
      case "accepted":
        return theme.accepted;
      case "preparing":
        return theme.preparing;
      case "ready":
        return theme.ready;
      case "served":
        return theme.served;
      default:
        return theme.pending;
    }
  };

  const statusColor = getStatusColor();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColor + "20",
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? Spacing.xs : Spacing.sm,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <ThemedText
        style={[
          styles.text,
          { color: statusColor, fontSize: isSmall ? 11 : 13 },
        ]}
      >
        {STATUS_LABELS[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
