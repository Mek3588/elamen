import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { RestaurantColors, BorderRadius, Spacing } from "@/constants/theme";

import WorkerProductsScreen from "@/screens/worker/WorkerProductsScreen";
import WorkerOrdersScreen from "@/screens/worker/WorkerOrdersScreen";
import WorkerProfileScreen from "@/screens/worker/WorkerProfileScreen";

export type WorkerTabParamList = {
  WorkerProductsTab: undefined;
  WorkerOrdersTab: undefined;
  WorkerProfileTab: undefined;
};

const Tab = createBottomTabNavigator<WorkerTabParamList>();

function TabIcon({ name, color, focused }: { name: keyof typeof Feather.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Feather name={name} size={22} color={color} />
    </View>
  );
}

export default function WorkerTabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="WorkerOrdersTab"
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
        name="WorkerProductsTab"
        component={WorkerProductsScreen}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkerOrdersTab"
        component={WorkerOrdersScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="clipboard" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkerProfileTab"
        component={WorkerProfileScreen}
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
