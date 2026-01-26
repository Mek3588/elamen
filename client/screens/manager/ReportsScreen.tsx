import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, Platform, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors, CURRENCY } from "@/constants/theme";

type ReportType = "daily" | "monthly";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { orders } = useData();

  const [isExporting, setIsExporting] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfDay
    );
    const monthlyOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth
    );

    const dailyRevenue = dailyOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const monthlyRevenue = monthlyOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      dailyOrders: dailyOrders.length,
      dailyRevenue,
      dailyCompleted: dailyOrders.filter((o) => o.status === "completed").length,
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue,
      monthlyCompleted: monthlyOrders.filter((o) => o.status === "completed").length,
    };
  }, [orders]);

  const generateCSV = (type: ReportType): string => {
    const today = new Date();
    const startDate = type === "daily"
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
      : new Date(today.getFullYear(), today.getMonth(), 1);

    const filteredOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startDate
    );

    let csv = "Order ID,Date,Time,Items,Total Amount,Status,Worker\n";

    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const itemsStr = order.items
        .map((i) => `${i.quantity}x ${i.productName}`)
        .join("; ");
      
      csv += `${order.id},${date.toLocaleDateString()},${date.toLocaleTimeString()},"${itemsStr}",${order.totalAmount.toFixed(2)},${order.status},${order.workerName || "N/A"}\n`;
    });

    const summary = type === "daily"
      ? `\nDaily Summary\nTotal Orders,${stats.dailyOrders}\nCompleted Orders,${stats.dailyCompleted}\nTotal Revenue,${stats.dailyRevenue.toFixed(2)}\n`
      : `\nMonthly Summary\nTotal Orders,${stats.monthlyOrders}\nCompleted Orders,${stats.monthlyCompleted}\nTotal Revenue,${stats.monthlyRevenue.toFixed(2)}\n`;

    return csv + summary;
  };

  const handleExport = async (type: ReportType) => {
    setIsExporting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const csv = generateCSV(type);
      const today = new Date();
      const filename = type === "daily"
        ? `elamen_daily_report_${today.toISOString().split("T")[0]}.csv`
        : `elamen_monthly_report_${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, "0")}.csv`;

      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: `Share ${type} Report`,
          });
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <ThemedText style={styles.sectionTitle}>Daily Report</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.medium]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: RestaurantColors.primary }]}>
                {stats.dailyOrders}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Orders
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: theme.completed }]}>
                {stats.dailyCompleted}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Completed
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: RestaurantColors.secondary }]}>
                {CURRENCY} {stats.dailyRevenue.toFixed(0)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Revenue
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => handleExport("daily")}
            disabled={isExporting}
            style={({ pressed }) => [
              styles.exportButton,
              {
                backgroundColor: RestaurantColors.primary,
                opacity: pressed || isExporting ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="download" size={18} color="#FFFFFF" />
            <ThemedText style={styles.exportButtonText}>
              Download Daily Report (CSV)
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <ThemedText style={styles.sectionTitle}>Monthly Report</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.surface }, Shadows.medium]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: RestaurantColors.primary }]}>
                {stats.monthlyOrders}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Orders
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: theme.completed }]}>
                {stats.monthlyCompleted}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Completed
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: RestaurantColors.secondary }]}>
                {CURRENCY} {stats.monthlyRevenue.toFixed(0)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Revenue
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => handleExport("monthly")}
            disabled={isExporting}
            style={({ pressed }) => [
              styles.exportButton,
              {
                backgroundColor: RestaurantColors.secondary,
                opacity: pressed || isExporting ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="download" size={18} color="#1A1A1A" />
            <ThemedText style={[styles.exportButtonText, { color: "#1A1A1A" }]}>
              Download Monthly Report (CSV)
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="info" size={18} color={theme.textSecondary} />
          <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
            Reports are exported as CSV files which can be opened in Excel, Google Sheets, or any spreadsheet application.
          </ThemedText>
        </View>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
