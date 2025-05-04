import React from "react";
import { SafeAreaView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Header from "./Header";

export default function MainLayout({ children }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <Header />
        {children} 
      </ThemedView>
    </SafeAreaView>
  );
}
