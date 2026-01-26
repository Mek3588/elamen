import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { RestaurantColors } from "@/constants/theme";

import WorkerProductsScreen from "@/screens/worker/WorkerProductsScreen";
import WorkerOrdersScreen from "@/screens/worker/WorkerOrdersScreen";
import WorkerProfileScreen from "@/screens/worker/WorkerProfileScreen";

export type WorkerTabParamList = {
  WorkerProductsTab: undefined;
  WorkerOrdersTab: undefined;
  WorkerProfileTab: undefined;
};

const Tab = createBottomTabNavigator<WorkerTabParamList>();

export default function WorkerTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="WorkerOrdersTab"
      screenOptions={{
        tabBarActiveTintColor: RestaurantColors.primary,
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
        name="WorkerProductsTab"
        component={WorkerProductsScreen}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkerOrdersTab"
        component={WorkerOrdersScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Feather name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkerProfileTab"
        component={WorkerProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
