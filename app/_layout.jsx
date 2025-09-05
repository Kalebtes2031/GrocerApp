import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import "../i18n";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import Header from "@/components/Header"; // Import the Header component
import SearchComp from "@/components/SearchComp";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalProvider from "@/context/GlobalProvider";
import { CartProvider } from "@/context/CartProvider";
import { WatchlistProvider } from "@/context/WatchlistProvider";
import { LanguageProvider } from "@/context/LanguageProvider";
import { View } from "react-native";
import { Text } from "react-native";
import { FA5Style } from "@expo/vector-icons/build/FontAwesome5";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";
import { NotificationProvider } from "@/context/NotificationContext";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation("first");
  const colorScheme = useColorScheme();
  const [fontsLoaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-bold": require("../assets/fonts/Poppins-Bold.ttf"), // Note the lowercase
    "League Spartan": require("../assets/fonts/LeagueSpartan-Regular.ttf"),
  });

  useEffect(() => {
    if (error) console.error("Font loading error:", error);
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // useEffect(() => {
  //   const unsubscribe = NetInfo.addEventListener((state) => {
  //     if (!state.isConnected) {
  //       Toast.show({
  //         type: "error",
  //         text1: "No Internet Connection",
  //         text2: "Turn on mobile data to fetch data.",
  //         position: "top",
  //       });
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    // 1. Check the **initial** state
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        Toast.show({
          type: "error",
          text1: t("no_internet"),
          text2: t("check_connection"),
          position: "top",
          autoHide: false,
        });
      }
    });

    // 2. Then subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        // if we go offline later
        Toast.show({
          type: "error",
          text1: t("no_internet"),
          text2: t("check_connection"),
          position: "top",
          autoHide: false,
        });
      } else {
        // back online
        Toast.hide();
        Toast.show({
          type: "success",
          text1: t("back_online"),
          position: "top",
          visibilityTime: 2000,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return null; // Show loading screen/image here
  }

  const toastConfig = {
    error: (props) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 15,
          fontWeight: "bold",
          color: "red",
        }}
        text2Style={{
          fontSize: 15,
          color: "#333",
        }}
        style={{
          borderLeftColor: "red",
          padding: 12,
          borderRadius: 8,
        }}
      />
    ),
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView
          style={[
            styles.safeArea,
            { backgroundColor: colorScheme === "dark" ? "#000" : "#fff" },
          ]}
        >
          {/* <Header /> */}

          <ErrorBoundary>
            <WatchlistProvider>
              <GlobalProvider>
                <NotificationProvider>
                  <CartProvider>
                    <LanguageProvider>
                      {/* <SearchComp /> */}
                      <Stack>
                        <Stack.Screen
                          name="(auth)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="index"
                          options={{ headerShown: false }}
                        />

                        <Stack.Screen
                          name="carddetail"
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="cartscreen"
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="checkout"
                          options={{
                            headerShown: false,
                          }}
                        />
                        <Stack.Screen
                          name="directpayment"
                          options={{
                            headerShown: false,
                          }}
                        />

                        <Stack.Screen name="+not-found" />
                      </Stack>
                      {/* <Toast /> */}
                      <Toast config={toastConfig} />
                    </LanguageProvider>
                  </CartProvider>
                </NotificationProvider>
              </GlobalProvider>
            </WatchlistProvider>
          </ErrorBoundary>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
