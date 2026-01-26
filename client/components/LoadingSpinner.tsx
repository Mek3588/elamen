import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = true }: LoadingSpinnerProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? theme.backgroundRoot : "transparent" },
      ]}
    >
      <ActivityIndicator size="large" color={theme.link} />
      {message ? (
        <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: 14,
  },
});
