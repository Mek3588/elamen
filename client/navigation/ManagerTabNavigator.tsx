import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { RestaurantColors } from "@/constants/theme";

import ManagerDashboardScreen from "@/screens/manager/ManagerDashboardScreen";
import ManagerOrdersScreen from "@/screens/manager/ManagerOrdersScreen";
import ManagerProductsScreen from "@/screens/manager/ManagerProductsScreen";
import ManagerAnalyticsScreen from "@/screens/manager/ManagerAnalyticsScreen";

export type ManagerTabParamList = {
  ManagerDashboardTab: undefined;
  ManagerOrdersTab: undefined;
  ManagerProductsTab: undefined;
  ManagerAnalyticsTab: undefined;
};

const Tab = createBottomTabNavigator<ManagerTabParamList>();

export default function ManagerTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="ManagerDashboardTab"
      screenOptions={{
        tabBarActiveTintColor: RestaurantColors.secondary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ManagerDashboardTab"
        component={ManagerDashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerOrdersTab"
        component={ManagerOrdersScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Feather name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerProductsTab"
        component={ManagerProductsScreen}
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Feather name="package" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerAnalyticsTab"
        component={ManagerAnalyticsScreen}
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
