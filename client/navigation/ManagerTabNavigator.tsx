import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { RestaurantColors, BorderRadius, Spacing } from "@/constants/theme";

import ManagerDashboardScreen from "@/screens/manager/ManagerDashboardScreen";
import ManagerOrdersScreen from "@/screens/manager/ManagerOrdersScreen";
import ManagerProductsScreen from "@/screens/manager/ManagerProductsScreen";
import ManagerProfileScreen from "@/screens/manager/ManagerProfileScreen";

export type ManagerTabParamList = {
  ManagerDashboardTab: undefined;
  ManagerOrdersTab: undefined;
  ManagerProductsTab: undefined;
  ManagerProfileTab: undefined;
};

const Tab = createBottomTabNavigator<ManagerTabParamList>();

function TabIcon({ name, color, focused }: { name: keyof typeof Feather.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Feather name={name} size={22} color={color} />
    </View>
  );
}

export default function ManagerTabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="ManagerDashboardTab"
      screenOptions={{
        tabBarActiveTintColor: RestaurantColors.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: Spacing.sm,
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.surface,
          }),
          borderTopWidth: 0,
          elevation: 0,
          ...Platform.select({
            android: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
          }),
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={90}
              tint={isDark ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, styles.blurContainer]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surface }]} />
          ),
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ManagerDashboardTab"
        component={ManagerDashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerOrdersTab"
        component={ManagerOrdersScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="clipboard" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerProductsTab"
        component={ManagerProductsScreen}
        options={{
          title: "Products",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="package" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerProfileTab"
        component={ManagerProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  iconContainer: {
    width: 44,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
  },
  iconContainerFocused: {
    backgroundColor: `${RestaurantColors.primary}15`,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
