import { Stack } from 'expo-router';

export default function AdminProductsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="[productId]/index" />
      <Stack.Screen name="[productId]/edit" />
    </Stack>
  );
}
