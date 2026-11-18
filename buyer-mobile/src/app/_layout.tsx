import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
  name="cart"
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="orders"
  options={{ headerShown: false }}
/>
<Stack.Screen
    name="payment"
    options={{ headerShown: false }}
  />
      </Stack>
    </ThemeProvider>
  );
}