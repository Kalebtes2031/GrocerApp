import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedView } from "./ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTranslation } from "react-i18next";

const SearchComp = ({ onSearch = () => {} }) => {
  const { t } = useTranslation("shop"); // Load translations from 'shop' namespace
  const colorScheme = useColorScheme();
  const [text, setText] = useState("");

  const handleChangeText = (input) => {
    setText(input);
    onSearch(input); // Callback function to handle search logic
  };

  const handleClearText = () => {
    setText("");
    onSearch(""); // Reset search results
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#333" : "#F5F5F5" },
      ]}
    >
      {/* Search Icon */}

      {/* Search Input */}
      <TextInput
        style={[
          styles.input,
          { color: colorScheme === "dark" ? "#fff" : "#333" },
        ]}
        placeholder={t("search")} // Translated placeholder
        placeholderTextColor="#888"
        value={text}
        onChangeText={handleChangeText}
      />
      <MaterialIcons
        name="search"
        size={24}
        style={[
          styles.icon,
          { color: colorScheme === "dark" ? "#fff" : "#333" },
        ]}
      />
      {/* Clear Button */}
      {text.length > 0 && (
        <TouchableOpacity onPress={handleClearText} style={styles.clearButton}>
          <MaterialIcons name="close" size={20} color="#888" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 25,
    margin: 10,
    justifyContent: "space-between",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
  },
});

export default SearchComp;
