import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

// const baseUrl = "https://yasonbackend.yasonsc.com/account/"; // Adjust to your API base URL
const baseUrl = "https://backendsupermarket.activetechet.com/account/"; // Adjust to your API base URL

export default function ForgotPasswordScreen() {
  const { t, i18n } = useTranslation(["forgot", "errormessage"]);
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [channel, setChannel] = useState("email"); // 'sms' or 'email'
  const [loading, setLoading] = useState(false);

  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: "top",
    });
  };

  const handleSendOTP = async () => {
    if (!emailOrPhone) {
      showToast("error", t("enter_email_phone"));
      return;
    }
    try {
      setLoading(true);
      // normalize the identifier
      const identifier =
        channel === "email"
          ? emailOrPhone.trim().toLowerCase()
          : emailOrPhone.trim();
      (await axios.post(
        `${baseUrl}auth/password-reset/`,
        { email_or_phone: identifier, channel },
        { headers: { "Content-Type": "application/json" } }
      ));
      showToast("success", t("otp_sent"));
      router.push({
        pathname: "/(auth)/otp-verification",
        params: { emailOrPhone:identifier, channel },
      });
    } catch (error) {
       const rawMsg = error.response?.data?.error || "otp_failed";

       // 2. Map it to a key in errormessage.json
       let errorKey;
       switch (rawMsg) {
         case "User with this email not found":
           errorKey = "user_not_found";
           break;
         // if the backend might send other English phrases, add more cases here:
         // case "Some other validation error": errorKey = "some_other_error_key"; break;
         default:
           // fallback to a generic “OTP failed” key
           errorKey = "otp_failed";
       }

       // 3. Use t(...) with the "errormessage" namespace
       //
       //    Because you passed ["forgot","errormessage"] above, you can write:
       showToast("error", t(`errormessage:${errorKey}`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("reset")}</Text>
        <TextInput
          style={styles.input}
          placeholder={channel === "sms" ? t("phone") : t("email")}
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType={channel === "sms" ? "phone-pad" : "email-address"}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.button,
            (!emailOrPhone || loading) && styles.buttonDisabled,
          ]}
          onPress={handleSendOTP}
          disabled={!emailOrPhone || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("send")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#445399",
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#445399",
    padding: 10,
    borderRadius: 24,
    color: "#445399",
  },
  button: {
    backgroundColor: "#445399",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
