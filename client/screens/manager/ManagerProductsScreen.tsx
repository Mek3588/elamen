import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors, CURRENCY } from "@/constants/theme";
import { Product } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface ProductRowProps {
  product: Product;
  onPress: () => void;
  onToggleAvailability: (available: boolean) => void;
}

function ProductRow({ product, onPress, onToggleAvailability }: ProductRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.productRow,
        { backgroundColor: theme.surface, opacity: pressed ? 0.9 : 1 },
        Shadows.small,
      ]}
    >
      <View
        style={[
          styles.productImage,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="image" size={24} color={theme.textSecondary} />
      </View>

      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={1}>
          {product.name}
        </ThemedText>
        <ThemedText style={[styles.productCategory, { color: theme.textSecondary }]}>
          {product.category}
        </ThemedText>
        <ThemedText style={[styles.productPrice, { color: theme.link }]}>
          {CURRENCY} {product.price.toFixed(2)}
        </ThemedText>
      </View>

      <View style={styles.productActions}>
        <Switch
          value={product.available}
          onValueChange={(value) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleAvailability(value);
          }}
          trackColor={{
            false: theme.backgroundDefault,
            true: RestaurantColors.status.completed + "80",
          }}
          thumbColor={product.available ? RestaurantColors.status.completed : theme.textSecondary}
        />
      </View>
    </Pressable>
  );
}

export default function ManagerProductsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { products, isLoading, updateProduct, refreshData } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductForm", { productId: product.id });
  };

  const handleAddProduct = () => {
    navigation.navigate("ProductForm", {});
  };

  const handleToggleAvailability = async (productId: string, available: boolean) => {
    await updateProduct(productId, { available });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredProducts}
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
                placeholder="Search products..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statChip,
                  { backgroundColor: theme.success + "20" },
                ]}
              >
                <View
                  style={[styles.statDot, { backgroundColor: theme.success }]}
                />
                <ThemedText style={styles.statText}>
                  {products.filter((p) => p.available).length} Available
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statChip,
                  { backgroundColor: theme.error + "20" },
                ]}
              >
                <View
                  style={[styles.statDot, { backgroundColor: theme.error }]}
                />
                <ThemedText style={styles.statText}>
                  {products.filter((p) => !p.available).length} Unavailable
                </ThemedText>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            image={require("../../../assets/images/empty-products.png")}
            title="No products yet"
            description="Add your first menu item to get started"
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <ProductRow
              product={item}
              onPress={() => handleProductPress(item)}
              onToggleAvailability={(available) =>
                handleToggleAvailability(item.id, available)
              }
            />
          </Animated.View>
        )}
      />

      <Pressable
        onPress={handleAddProduct}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: RestaurantColors.primary,
            bottom: tabBarHeight + Spacing.lg,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
          Shadows.large,
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 13,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "600",
  },
  productActions: {
    marginLeft: Spacing.md,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
