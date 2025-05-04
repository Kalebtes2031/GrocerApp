// app/(tabs)/cart/_layout.jsx
import { Stack } from "expo-router";

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen name="directpayment" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="schedule" options={{ headerShown: false }} />
      {/* <Stack.Screen name="orderinfo" options={{ headerShown: false }} /> */}
    </Stack>
  );
}
