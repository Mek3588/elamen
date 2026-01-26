import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, CURRENCY } from "@/constants/theme";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToOrder?: () => void;
  showAddButton?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({
  product,
  onPress,
  onAddToOrder,
  showAddButton = true,
}: ProductCardProps) {
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

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddToOrder?.();
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
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <Feather name="image" size={32} color={theme.textSecondary} />
        )}
        {!product.available && (
          <View style={styles.unavailableOverlay}>
            <ThemedText style={styles.unavailableText}>Unavailable</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {product.name}
          </ThemedText>
          <ThemedText style={[styles.price, { color: theme.link }]}>
            {CURRENCY} {product.price.toFixed(2)}
          </ThemedText>
        </View>

        <ThemedText
          style={[styles.category, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {product.category}
        </ThemedText>

        {product.description ? (
          <ThemedText
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {product.description}
          </ThemedText>
        ) : null}

        {showAddButton && product.available ? (
          <Pressable
            onPress={handleAddPress}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: theme.link, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  imageContainer: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
  },
  category: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
