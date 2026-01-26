import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

import LoginScreen from "@/screens/LoginScreen";
import WorkerStackNavigator from "@/navigation/WorkerStackNavigator";
import ManagerStackNavigator from "@/navigation/ManagerStackNavigator";

export type RootStackParamList = {
  Login: undefined;
  WorkerApp: undefined;
  ManagerApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
      <ActivityIndicator size="large" color={theme.link} />
    </View>
  );
}

function AuthNavigator() {
  const { user, isLoading } = useAuth();
  const screenOptions = useScreenOptions();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === "worker" ? (
        <Stack.Screen name="WorkerApp" component={WorkerStackNavigator} />
      ) : (
        <Stack.Screen name="ManagerApp" component={ManagerStackNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function RootStackNavigator() {
  return <AuthNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
