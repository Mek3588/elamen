import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors } from "@/constants/theme";
import { UserRole } from "@/types";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("worker");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await login(username.trim(), password, selectedRole);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError("Login failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(600)}
        style={styles.headerContainer}
      >
        <ThemedText style={styles.title}>EL/Amen</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Food Court Management
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        style={styles.formContainer}
      >
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          Select your role
        </ThemedText>

        <View style={styles.roleSelector}>
          <Pressable
            onPress={() => handleRoleSelect("worker")}
            style={({ pressed }) => [
              styles.roleButton,
              {
                backgroundColor:
                  selectedRole === "worker"
                    ? RestaurantColors.primary
                    : theme.backgroundDefault,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.roleText,
                {
                  color:
                    selectedRole === "worker" ? "#FFFFFF" : theme.textSecondary,
                },
              ]}
            >
              Worker
            </ThemedText>
            <ThemedText
              style={[
                styles.roleDescription,
                {
                  color:
                    selectedRole === "worker"
                      ? "rgba(255,255,255,0.8)"
                      : theme.textSecondary,
                },
              ]}
            >
              Kitchen Staff
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => handleRoleSelect("manager")}
            style={({ pressed }) => [
              styles.roleButton,
              {
                backgroundColor:
                  selectedRole === "manager"
                    ? RestaurantColors.secondary
                    : theme.backgroundDefault,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.roleText,
                {
                  color:
                    selectedRole === "manager"
                      ? "#1A1A1A"
                      : theme.textSecondary,
                },
              ]}
            >
              Manager
            </ThemedText>
            <ThemedText
              style={[
                styles.roleDescription,
                {
                  color:
                    selectedRole === "manager"
                      ? "rgba(0,0,0,0.6)"
                      : theme.textSecondary,
                },
              ]}
            >
              Admin Panel
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Username
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Enter your username"
            placeholderTextColor={theme.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            testID="input-username"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Password
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="input-password"
          />
        </View>

        {error ? (
          <ThemedText style={[styles.error, { color: theme.error }]}>
            {error}
          </ThemedText>
        ) : null}

        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.loginButton,
            {
              backgroundColor:
                selectedRole === "worker"
                  ? RestaurantColors.primary
                  : RestaurantColors.secondary,
              opacity: pressed || isLoading ? 0.8 : 1,
            },
            Shadows.medium,
          ]}
          testID="button-login"
        >
          <ThemedText style={[
            styles.loginButtonText,
            { color: selectedRole === "manager" ? "#1A1A1A" : "#FFFFFF" }
          ]}>
            {isLoading ? "Signing in..." : "Sign In"}
          </ThemedText>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(600)}>
        <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
          Enter any username to continue
        </ThemedText>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  roleSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  roleText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  roleDescription: {
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
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
  error: {
    fontSize: 14,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  loginButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: Spacing["3xl"],
  },
});
