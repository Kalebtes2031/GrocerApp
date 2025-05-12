// AnimatedCountdown.jsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import CountdownBox from "./CountdownBox";
import { useTranslation } from "react-i18next";


const AnimatedCountdown = ({ scheduledTime, warningColor, successColor }) => {
  const { t} = useTranslation("animatedcountdown");
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
      <CountdownBox value={timeLeft.days} label={t('days')} />
      <CountdownBox value={timeLeft.hours} label={t('hours')}/>
      <CountdownBox value={timeLeft.minutes} label={t('minutes')} />
      <CountdownBox value={timeLeft.seconds} label={t('seconds')} />
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
