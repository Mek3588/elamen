import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, TextInput, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors, CURRENCY } from "@/constants/theme";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";

type RouteParams = {
  ProductForm: {
    productId?: string;
  };
};

const CATEGORIES = ["Mains", "Vegetarian", "Fast Food", "Drinks", "Desserts", "Sides"];

export default function ProductFormScreen() {
  const route = useRoute<RouteProp<RouteParams, "ProductForm">>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { products, addProduct, updateProduct, deleteProduct } = useData();

  const existingProduct = useMemo(() => {
    if (route.params?.productId) {
      return products.find((p) => p.id === route.params.productId);
    }
    return null;
  }, [products, route.params?.productId]);

  const [name, setName] = useState(existingProduct?.name || "");
  const [price, setPrice] = useState(existingProduct?.price?.toString() || "");
  const [category, setCategory] = useState(existingProduct?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(existingProduct?.description || "");
  const [available, setAvailable] = useState(existingProduct?.available ?? true);
  const [imageUri, setImageUri] = useState<string | null>(existingProduct?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!existingProduct;

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Valid price is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);

    try {
      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        category,
        description: description.trim(),
        available,
      };

      // Determine if we need to upload image
      let imageToUpload: string | undefined = undefined;
      if (imageUri && imageUri !== existingProduct?.imageUrl) {
        // If imageUri is a local file (starts with file:// or content://) or is a new image
        if (imageUri.startsWith('file://') || imageUri.startsWith('content://') || !imageUri.startsWith('http')) {
          imageToUpload = imageUri;
        }
      }

      if (isEditing && existingProduct) {
        await updateProduct(existingProduct.id, productData, imageToUpload);
      } else {
        await addProduct(productData, imageToUpload);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingProduct) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsSaving(true);

    try {
      await deleteProduct(existingProduct.id);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Pressable onPress={pickImage} style={styles.imageUpload}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.imagePlaceholder,
                { backgroundColor: theme.backgroundDefault },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="camera" size={32} color={theme.textSecondary} />
              <ThemedText style={[styles.imageText, { color: theme.textSecondary }]}>
                Add Photo
              </ThemedText>
            </View>
          )}
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Product Name
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: errors.name ? theme.error : theme.border,
                color: theme.text,
              },
            ]}
            placeholder="e.g. Doro Wat"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            testID="input-product-name"
          />
          {errors.name ? (
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              {errors.name}
            </ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Price ({CURRENCY})
          </ThemedText>
          <View style={styles.priceInputContainer}>
            <ThemedText style={styles.currencySymbol}>{CURRENCY}</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.priceInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: errors.price ? theme.error : theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              testID="input-product-price"
            />
          </View>
          {errors.price ? (
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              {errors.price}
            </ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)}>
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Category
          </ThemedText>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategory(cat);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      category === cat
                        ? RestaurantColors.primary
                        : theme.surface,
                    borderColor:
                      category === cat
                        ? RestaurantColors.primary
                        : theme.border,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.categoryText,
                    { color: category === cat ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {cat}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Description (Optional)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Brief description of the dish..."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(500)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAvailable(!available);
          }}
          style={[
            styles.availabilityRow,
            { backgroundColor: theme.surface },
            Shadows.small,
          ]}
        >
          <View style={styles.availabilityInfo}>
            <ThemedText style={styles.availabilityLabel}>Available</ThemedText>
            <ThemedText style={[styles.availabilityDescription, { color: theme.textSecondary }]}>
              {available ? "This item is visible to workers" : "This item is hidden"}
            </ThemedText>
          </View>
          <View
            style={[
              styles.toggle,
              {
                backgroundColor: available
                  ? RestaurantColors.status.completed
                  : theme.backgroundDefault,
              },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  backgroundColor: "#FFFFFF",
                  transform: [{ translateX: available ? 20 : 0 }],
                },
              ]}
            />
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: RestaurantColors.primary,
              opacity: pressed || isSaving ? 0.8 : 1,
            },
            Shadows.medium,
          ]}
          testID="button-save-product"
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Product"}
          </ThemedText>
        </Pressable>

        {isEditing ? (
          <Pressable
            onPress={handleDelete}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.deleteButton,
              {
                borderColor: theme.error,
                opacity: pressed || isSaving ? 0.6 : 1,
              },
            ]}
          >
            <Feather name="trash-2" size={18} color={theme.error} />
            <ThemedText style={[styles.deleteButtonText, { color: theme.error }]}>
              Delete Product
            </ThemedText>
          </Pressable>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageUpload: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: Spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  availabilityDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  saveButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
