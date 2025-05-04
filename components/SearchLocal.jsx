import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";

export default function SearchLocal({
  value,
  onChangeText,
  placeholder,
  clearSearch,
}) {
  return (
    <View style={styles.container}>
      {/* Search icon */}
      <Feather name="search" size={20} color="#445399" style={styles.icon} />

      {/* Text input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        returnKeyType="search"
        placeholderTextColor="#445399"
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      {/* Clear button */}
      {value?.length > 0 && (
        <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
          <FontAwesome name="times-circle" size={18} color="#445399" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#445399",
    paddingHorizontal: 12,
    height: 50,
    margin: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearIcon: {
    marginLeft: 8,
  },
});
