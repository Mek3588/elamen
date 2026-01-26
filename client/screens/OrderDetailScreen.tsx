import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, TextInput, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatusBadge } from "@/components/StatusBadge";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors } from "@/constants/theme";
import { OrderStatus } from "@/types";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";

type RouteParams = {
  OrderDetail: {
    orderId: string;
  };
};

const STATUS_FLOW: OrderStatus[] = ["pending", "accepted", "preparing", "ready", "served"];

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, "OrderDetail">>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { orders, updateOrderStatus, addOrderNotes } = useData();

  const order = useMemo(() => {
    return orders.find((o) => o.id === route.params.orderId);
  }, [orders, route.params.orderId]);

  const [notes, setNotes] = useState(order?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Order not found</ThemedText>
      </View>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const canProgress = currentStatusIndex < STATUS_FLOW.length - 1;
  const nextStatus = canProgress ? STATUS_FLOW[currentStatusIndex + 1] : null;

  const handleProgressStatus = async () => {
    if (!nextStatus) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);
    
    try {
      await updateOrderStatus(order.id, nextStatus, user?.id, user?.username);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSaving(true);
    
    try {
      await addOrderNotes(order.id, notes);
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getNextStatusLabel = () => {
    switch (nextStatus) {
      case "accepted":
        return "Accept Order";
      case "preparing":
        return "Start Preparing";
      case "ready":
        return "Mark as Ready";
      case "served":
        return "Mark as Served";
      default:
        return "";
    }
  };

  const getNextStatusColor = () => {
    switch (nextStatus) {
      case "accepted":
        return theme.accepted;
      case "preparing":
        return theme.preparing;
      case "ready":
        return theme.ready;
      case "served":
        return theme.served;
      default:
        return theme.link;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: canProgress ? 120 : insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <View style={styles.orderHeader}>
                <View>
                  <ThemedText style={styles.orderNumber}>
                    Order #{order.id.slice(-4)}
                  </ThemedText>
                  {order.tableNumber ? (
                    <ThemedText style={[styles.tableNumber, { color: theme.textSecondary }]}>
                      Table {order.tableNumber}
                    </ThemedText>
                  ) : null}
                </View>
                <StatusBadge status={order.status} />
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(150).duration(500)}
              style={[styles.card, { backgroundColor: theme.surface }, Shadows.small]}
            >
              <View style={styles.cardRow}>
                <Feather name="clock" size={16} color={theme.textSecondary} />
                <ThemedText style={[styles.cardLabel, { color: theme.textSecondary }]}>
                  Created
                </ThemedText>
                <ThemedText style={styles.cardValue}>
                  {new Date(order.createdAt).toLocaleString()}
                </ThemedText>
              </View>
              {order.workerName ? (
                <View style={styles.cardRow}>
                  <Feather name="user" size={16} color={theme.textSecondary} />
                  <ThemedText style={[styles.cardLabel, { color: theme.textSecondary }]}>
                    Assigned to
                  </ThemedText>
                  <ThemedText style={styles.cardValue}>
                    {order.workerName}
                  </ThemedText>
                </View>
              ) : null}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <ThemedText style={styles.sectionTitle}>Items</ThemedText>
            </Animated.View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(250 + index * 50).duration(400)}
            style={[styles.itemRow, { backgroundColor: theme.surface }, Shadows.small]}
          >
            <View style={styles.itemQuantity}>
              <ThemedText style={styles.quantityText}>{item.quantity}x</ThemedText>
            </View>
            <View style={styles.itemDetails}>
              <ThemedText style={styles.itemName}>{item.productName}</ThemedText>
              {item.notes ? (
                <ThemedText style={[styles.itemNotes, { color: theme.textSecondary }]}>
                  {item.notes}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText style={[styles.itemPrice, { color: theme.link }]}>
              ${(item.price * item.quantity).toFixed(2)}
            </ThemedText>
          </Animated.View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Animated.View
              entering={FadeInDown.delay(350).duration(500)}
              style={[styles.totalCard, { backgroundColor: theme.surface }, Shadows.small]}
            >
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={[styles.totalValue, { color: theme.link }]}>
                ${order.totalAmount.toFixed(2)}
              </ThemedText>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              style={styles.notesSection}
            >
              <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
              <View
                style={[
                  styles.notesContainer,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <TextInput
                  style={[styles.notesInput, { color: theme.text }]}
                  placeholder="Add notes for this order..."
                  placeholderTextColor={theme.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <Pressable
                onPress={handleSaveNotes}
                disabled={isSaving || notes === order.notes}
                style={({ pressed }) => [
                  styles.saveNotesButton,
                  {
                    backgroundColor: theme.backgroundDefault,
                    opacity: pressed || isSaving || notes === order.notes ? 0.6 : 1,
                  },
                ]}
              >
                <ThemedText style={styles.saveNotesText}>Save Notes</ThemedText>
              </Pressable>
            </Animated.View>
          </View>
        }
      />

      {canProgress ? (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.actionBar,
            { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          <Pressable
            onPress={handleProgressStatus}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: getNextStatusColor(),
                opacity: pressed || isSaving ? 0.8 : 1,
              },
              Shadows.medium,
            ]}
          >
            <ThemedText style={styles.actionButtonText}>
              {isSaving ? "Updating..." : getNextStatusLabel()}
            </ThemedText>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  orderNumber: {
    fontSize: 28,
    fontWeight: "700",
  },
  tableNumber: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardLabel: {
    fontSize: 14,
    flex: 1,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  itemQuantity: {
    width: 40,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
  },
  itemNotes: {
    fontSize: 13,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    marginTop: Spacing.lg,
  },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  notesSection: {
    marginBottom: Spacing.lg,
  },
  notesContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveNotesButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  saveNotesText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
