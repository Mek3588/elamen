import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import ManagerTabNavigator from "@/navigation/ManagerTabNavigator";
import OrderDetailScreen from "@/screens/OrderDetailScreen";
import ProductFormScreen from "@/screens/ProductFormScreen";

export type ManagerStackParamList = {
  ManagerTabs: undefined;
  OrderDetail: { orderId: string };
  ProductForm: { productId?: string };
};

const Stack = createNativeStackNavigator<ManagerStackParamList>();

export default function ManagerStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ManagerTabs"
        component={ManagerTabNavigator}
        options={{
          headerTitle: () => <HeaderTitle title="Kitchen Flow" />,
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          headerTitle: "Order Details",
        }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({
          headerTitle: route.params?.productId ? "Edit Product" : "New Product",
          presentation: "modal",
        })}
      />
    </Stack.Navigator>
  );
}
