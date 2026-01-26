import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors } from "@/constants/theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
  color?: string;
  showArrow?: boolean;
}

function MenuItem({ icon, label, onPress, color, showArrow = true }: MenuItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.surface, opacity: pressed ? 0.8 : 1 },
        Shadows.small,
      ]}
    >
      <View style={styles.menuItemLeft}>
        <Feather name={icon} size={20} color={color || theme.text} />
        <ThemedText style={[styles.menuItemText, color ? { color } : null]}>
          {label}
        </ThemedText>
      </View>
      {showArrow ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function ManagerProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await logout();
  };

  const handleWorkersPress = () => {
    navigation.navigate("WorkerManagement");
  };

  const handleReportsPress = () => {
    navigation.navigate("Reports");
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.profileSection}
      >
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: RestaurantColors.secondary + "30" },
          ]}
        >
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={styles.username}>{user?.username}</ThemedText>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: RestaurantColors.secondary },
          ]}
        >
          <ThemedText style={[styles.roleText, { color: "#1A1A1A" }]}>Manager</ThemedText>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={styles.section}
      >
        <ThemedText
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          Management
        </ThemedText>
        <MenuItem icon="users" label="Manage Workers" onPress={handleWorkersPress} />
        <MenuItem icon="file-text" label="Download Reports" onPress={handleReportsPress} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(500)}
        style={styles.section}
      >
        <ThemedText
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          Settings
        </ThemedText>
        <MenuItem icon="bell" label="Notifications" />
        <ThemeToggle />
        <MenuItem icon="help-circle" label="Help & Support" />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(500)}
        style={styles.section}
      >
        <ThemedText
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          Account
        </ThemedText>
        <MenuItem
          icon="log-out"
          label="Sign Out"
          onPress={handleLogout}
          color={theme.error}
          showArrow={false}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={styles.footer}
      >
        <ThemedText style={[styles.version, { color: theme.textSecondary }]}>
          EL/Amen v1.0.0
        </ThemedText>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 80,
    height: 80,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  version: {
    fontSize: 13,
  },
});
