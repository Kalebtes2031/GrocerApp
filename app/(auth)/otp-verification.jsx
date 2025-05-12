import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
// import i18n from "@/i18n";

const baseUrl = "https://yasonbackend.yasonsc.com/account/";

export default function OTPVerificationScreen() {
  const { t, i18n } = useTranslation("otpverify");
  const router = useRouter();
  const { emailOrPhone, channel } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: "top",
    });
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showToast("error", t("invalid_otp"));
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}auth/verify-otp/`,
        { email_or_phone: emailOrPhone, code: otp },
        { headers: { "Content-Type": "application/json" } }
      );
      const { reset_token } = response.data;
      showToast("success", t("otp_verified"));
      router.push({
        pathname: "/(auth)/new-password",
        params: { reset_token },
      });
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.error || t("verification_failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text style={{textAlign: "center",fontSize: 16}}>
            {t("instruction")} <Text style={{color: "#445399"}}>{ emailOrPhone }</Text> {t("instruction1")} {i18n.language === "en" ? {channel} : ""}
          </Text>
          <Text style={styles.instruction}>{t("new")}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder={t("otp_placeholder")}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("verify_button")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  instruction: { textAlign: "center", marginBottom: 20, fontSize: 16 },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 24,
  },
  button: {
    backgroundColor: "#445399",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#44539980",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
