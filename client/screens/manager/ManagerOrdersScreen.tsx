import React, { useState, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
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
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { Order, OrderStatus } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type FilterType = "all" | OrderStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "served", label: "Served" },
];

export default function ManagerOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { orders, isLoading, refreshData } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "all" || order.status === activeFilter;
      const matchesSearch =
        order.id.includes(searchQuery) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  const getFilterCount = (filter: FilterType) => {
    if (filter === "all") return orders.length;
    return orders.filter((o) => o.status === filter).length;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate("OrderDetail", { orderId: order.id });
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
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: theme.surface },
                Shadows.small,
              ]}
            >
              <Feather name="search" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search orders..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.key}
              style={styles.filtersList}
              renderItem={({ item }) => {
                const count = getFilterCount(item.key);
                return (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveFilter(item.key);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          activeFilter === item.key
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
                            activeFilter === item.key ? "#FFFFFF" : theme.text,
                        },
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                    {count > 0 ? (
                      <View
                        style={[
                          styles.filterBadge,
                          {
                            backgroundColor:
                              activeFilter === item.key
                                ? "rgba(255,255,255,0.3)"
                                : theme.backgroundDefault,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.filterBadgeText,
                            {
                              color:
                                activeFilter === item.key
                                  ? "#FFFFFF"
                                  : theme.textSecondary,
                            },
                          ]}
                        >
                          {count}
                        </ThemedText>
                      </View>
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            image={require("../../../assets/images/empty-orders.png")}
            title="No orders found"
            description="Orders matching your filter will appear here"
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <OrderCard
              order={item}
              onPress={() => handleOrderPress(item)}
              showWorker
            />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  filtersList: {
    marginTop: Spacing.lg,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
