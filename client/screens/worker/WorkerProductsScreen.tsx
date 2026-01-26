import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { Product } from "@/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function WorkerProductsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { products, isLoading, createOrder } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return ["All", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "All" ||
        p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.available;
    });
  }, [products, searchQuery, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    await createOrder(orderItems);
    setCart([]);
    navigation.navigate("WorkerOrdersTab");
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading menu..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: cart.length > 0 ? 140 : tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
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
                placeholder="Search menu..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              style={styles.categoriesList}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCategory(item === "All" ? null : item);
                    }}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          (item === "All" && !selectedCategory) ||
                          selectedCategory === item
                            ? theme.link
                            : theme.surface,
                      },
                      Shadows.small,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryText,
                        {
                          color:
                            (item === "All" && !selectedCategory) ||
                            selectedCategory === item
                              ? "#FFFFFF"
                              : theme.text,
                        },
                      ]}
                    >
                      {item}
                    </ThemedText>
                  </Pressable>
                </Animated.View>
              )}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            image={require("../../../assets/images/empty-products.png")}
            title="No products found"
            description="Try adjusting your search or filter"
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 50).duration(400)}
            style={styles.cardWrapper}
          >
            <ProductCard
              product={item}
              onAddToOrder={() => handleAddToCart(item)}
              showAddButton
            />
          </Animated.View>
        )}
      />

      {cart.length > 0 ? (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.cartBar,
            { backgroundColor: theme.link, bottom: tabBarHeight + Spacing.lg },
            Shadows.large,
          ]}
        >
          <Pressable
            onPress={handleCreateOrder}
            style={styles.cartBarContent}
          >
            <View style={styles.cartInfo}>
              <View style={styles.cartBadge}>
                <ThemedText style={styles.cartBadgeText}>
                  {cartItemCount}
                </ThemedText>
              </View>
              <ThemedText style={styles.cartLabel}>Create Order</ThemedText>
            </View>
            <ThemedText style={styles.cartTotal}>
              ${cartTotal.toFixed(2)}
            </ThemedText>
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
  categoriesList: {
    marginTop: Spacing.lg,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  row: {
    gap: Spacing.md,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: "50%",
  },
  cartBar: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  cartBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  cartInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  cartBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  cartLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  cartTotal: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
});
