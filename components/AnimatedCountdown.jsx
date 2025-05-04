// AnimatedCountdown.jsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import CountdownBox from "./CountdownBox";


const AnimatedCountdown = ({ scheduledTime, warningColor, successColor }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const scheduled = new Date(scheduledTime).getTime();
      let diff = scheduled - now;
      if (diff < 0) diff = 0;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledTime]);

  // Choose color based on remaining time
  const color = timeLeft.days === 0 && timeLeft.hours < 2 ? warningColor : successColor;

  return (
    <View style={styles.container}>
      <CountdownBox value={timeLeft.days} label="Days" />
      <CountdownBox value={timeLeft.hours} label="Hrs" />
      <CountdownBox value={timeLeft.minutes} label="Min" />
      <CountdownBox value={timeLeft.seconds} label="Sec" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default AnimatedCountdown;
