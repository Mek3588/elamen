import React from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

export function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <Pressable
      onPress={handleToggle}
      style={[
        styles.container,
        { backgroundColor: theme.surface },
        Shadows.small,
      ]}
    >
      <View style={styles.left}>
        <Feather 
          name={isDark ? "moon" : "sun"} 
          size={20} 
          color={theme.text} 
        />
        <ThemedText style={styles.label}>
          {isDark ? "Dark Mode" : "Light Mode"}
        </ThemedText>
      </View>
      <Switch
        value={isDark}
        onValueChange={handleToggle}
        trackColor={{ false: theme.border, true: theme.link }}
        thumbColor="#FFFFFF"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
