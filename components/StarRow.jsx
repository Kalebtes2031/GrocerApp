// components/StarRow.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Entypo, EvilIcons } from "@expo/vector-icons";

export default function StarRow({ stars = 0, size = 24 }) {
  // stars is an integer from 0 to 5
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((position) => (
        position <= stars ? (
          <Entypo
            key={position}
            name="star"
            size={size}
            color="#FFC107"            // filled star (Entypo)
            style={styles.icon}
          />
        ) : (
          <EvilIcons
            key={position}
            name="star"
            size={size}
            color="#FFC107"            // empty star (EvilIcons outline)
            style={styles.icon}
          />
        )
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginHorizontal: 2,
  },
});
