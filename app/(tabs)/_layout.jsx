import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { Tabs, useRouter, Slot, useSegments } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider"; // Ensure this is your context provider

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartProvider";

export default function TabLayout() {
  const { cart } = useCart();
  const { t, i18n } = useTranslation("tabs");
  const colorScheme = useColorScheme();
  const { isLogged } = useGlobalContext();
  const router = useRouter();
  const segments = useSegments();

  const hideTabs = segments[0] === "(auth)";

  // Redirect to the sign-in page if not logged in
  useEffect(() => {
    if (!isLogged) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLogged]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t("shop"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="shop" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cartscreen"
        options={{
          title: t("cart"),
          tabBarIcon: ({ color }) => (
            <AntDesign name="shoppingcart" size={32} color={color} />
          ),
          tabBarBadge: cart.total_items, // 🔥 This line shows the number
          tabBarBadgeStyle: {
            backgroundColor: "#445399",
            color: "white",
            fontSize: 12,
          },
        }}
      />


      <Tabs.Screen
        name="trackorder"
        options={{
          title: t("track"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="truck-delivery"
              size={24}
              color={color}
            />
          ),
        }}
      /> 
           <Tabs.Screen
        name="order"
        options={{
          title: t("myorders"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="work-history" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "Category",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
      <Tabs.Screen
        name="categorydetail"
        options={{
          title: "Category Detail",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
      {/* <Tabs.Screen
        name="checkout"
        options={{
          title: "Checkout",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      /> */}
      {/* <Tabs.Screen
        name="directpayment"
        options={{
          title: "Direct Payment",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      /> */}
      <Tabs.Screen
        name="collection"
        options={{
          title: "Schedule Delivery",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
      <Tabs.Screen
        name="orderinfo"
        options={{
          title: "Order Information",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
      <Tabs.Screen
        name="watchlistscreen"
        options={{
          title: "Watch-List Screen",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      />
      {/* <Tabs.Screen
        name="orderdelivery"
        options={{
          title: "home for delivery",
          tabBarItemStyle: { display: "none" },
          gestureEnabled: false,
        }}
      /> */}
    </Tabs>
  );
}
