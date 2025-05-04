// auth/forgot-password.jsx
import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import axios from "axios";

const baseUrl = "https://yasonbackend.yasonsc.com/account/"; // Adjust to your API base URL

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [channel, setChannel] = useState("email"); // 'sms' or 'email'
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!emailOrPhone) {
      Alert.alert("Error", "Please enter your email or phone.");
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${baseUrl}auth/password-reset/`,
        {
          email_or_phone: emailOrPhone,
          channel,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      Alert.alert("Success", "OTP sent. Please check your messages.");
      router.push({
        pathname: "/(auth)/otp-verification",
        params: { emailOrPhone, channel },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        label={channel === "sms" ? "Phone Number" : "Email"}
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        style={styles.input}
        keyboardType={channel === "sms" ? "phone-pad" : "email-address"}
      />
      {/* <Button
        mode="outlined"
        onPress={() => setChannel((prev) => (prev === "sms" ? "email" : "sms"))}
        style={styles.toggleButton}
      >
        <Text className="font-poppins-medium" style={{ color: "#445399" }}>
          Use {channel === "sms" ? "Email" : "SMS"} instead
        </Text>
      </Button> */}
      <Button
        mode="contained"
        onPress={handleSendOTP}
        loading={loading}
        disabled={!emailOrPhone || loading}
        style={{backgroundColor: "#445399"}}
      >
        <Text style={{ color: "white", }}>Send OTP</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#445399",
  },
  input: { marginBottom: 15, backgroundColor: "white" },
  toggleButton: { marginBottom: 15, color: "#445399" },
});

export default ForgotPasswordScreen;
