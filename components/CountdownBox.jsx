// CountdownBox.jsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const CountdownBox = ({ value, label }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate scale when value updates
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  return (
    <View style={styles.box}>
      <Animated.Text style={[styles.value, { transform: [{ scale: scaleAnim }] }]}>
        {value}
      </Animated.Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 60,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D4150",
  },
  label: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
});

export default CountdownBox;
