import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import WorkerTabNavigator from "@/navigation/WorkerTabNavigator";
import OrderDetailScreen from "@/screens/OrderDetailScreen";

export type WorkerStackParamList = {
  WorkerTabs: undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<WorkerStackParamList>();

export default function WorkerStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="WorkerTabs"
        component={WorkerTabNavigator}
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
    </Stack.Navigator>
  );
}
