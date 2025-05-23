import { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import CustomButton from "@/components/CustomButton";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import Toast from "react-native-toast-message";
import * as Font from "expo-font";
import { CREATE_NEW_CUSTOMER } from "@/hooks/useFetch";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const SignUp = () => {
  const { t, i18n } = useTranslation("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const colorScheme = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    // Required
    Object.entries(form).forEach(([key, value]) => {
      if (!value) errs[key] = t("fill");
    });
    // Email
    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) errs.email = t("invalid_email");
    }
    // Ethiopian phone
    if (form.phoneNumber) {
      const phoneRegex = /^(?:\+251|0)9\d{8}$/;
      if (!phoneRegex.test(form.phoneNumber))
        errs.phoneNumber = t("invalid_phone");
    }
    // Confirm password
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      errs.confirmPassword =
        t("password_mismatch") || "Passwords do not match.";
    }
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        phone_number: form.phoneNumber,
        username: form.username,
        email: form.email,
        password: form.password,
      };
      const response = await CREATE_NEW_CUSTOMER(payload);
      if (response) {
        Toast.show({ type: "success", text1: t("account_created") });
        setForm({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          username: "",
          email: "",
          password: "",
        });
        setErrors({});
        setTimeout(() => router.push("/sign-in"), 1500);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: extractErrorDetails(error),
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractErrorDetails = (error) => {
    if (error?.response?.data) {
      const data = error.response.data;
      if (typeof data === "string") return data;
      return (
        Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n") || "An unknown error occurred."
      );
    }
    return "An unknown error occurred.";
  };

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <Image
          source={require("@/assets/images/signup.png")}
          resizeMode="cover"
          style={{ width: "100%", height: 200 }}
        />
        <View className="absolute inset-0 bg-white/20" />
        <View className="absolute top-8 right-4 flex-row gap-x-1 items-center ">
          <LanguageToggle bgcolor="#445399" textcolor="#445399" />
        </View>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -64,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 16,
              color: "#445399",
              fontFamily: "Poppins-Bold",
            }}
            className="text-primary text-[20px] font-poppins-medium mb-4"
          >
            {t("title")}
          </Text>

          {/* Name Row */}
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                  padding: 14,
                  fontSize: 14,
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  height: 48,
                }}
                placeholder={t("first_name")}
                placeholderTextColor="#888"
                value={form.firstName}
                onChangeText={(text) => setForm({ ...form, firstName: text })}
              />
              {errors.firstName && (
                <Text style={{ color: "red", marginTop: 4, textAlign:"center" }}>
                  {errors.firstName}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                  padding: 14,
                  fontSize: 14,
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  height: 48,
                }}
                placeholder={t("last_name")}
                placeholderTextColor="#888"
                value={form.lastName}
                onChangeText={(text) => setForm({ ...form, lastName: text })}
              />
              {errors.lastName && (
                <Text style={{ color: "red", marginTop: 4, textAlign:"center" }}>
                  {errors.lastName}
                </Text>
              )}
            </View>
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={{
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder={t("phone_number")}
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={form.phoneNumber}
              onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
            />
            {errors.phoneNumber && (
              <Text style={{ color: "red", marginTop: 4, textAlign:"center" }}>
                {errors.phoneNumber}
              </Text>
            )}
          </View>

          {/* Username */}
          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={{
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder={t("username")}
              placeholderTextColor="#888"
              value={form.username}
              onChangeText={(text) => setForm({ ...form, username: text })}
            />
            {errors.username && (
              <Text style={{ color: "red", marginTop: 4, textAlign:"center" }}>
                {errors.username}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={{
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder={t("email")}
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
            {errors.email && (
              <Text style={{ color: "red", marginTop: 4, textAlign:"center" }}>{errors.email}</Text>
            )}
          </View>

          {/* Password */}
          <View style={{ marginBottom: 16, position: "relative" }}>
            <TextInput
              style={{
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder={t("password")}
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 10, top: 8, padding: 5 }}
            >
              <Image
                source={
                  showPassword
                    ? require("@/assets/icons/eye.png")
                    : require("@/assets/icons/eye-hide.png")
                }
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {errors.password && (
              <Text style={{ color: "red", marginTop: 4, textAlign:"center" }}>
                {errors.password}
              </Text>
            )}
          </View>
          {/* Confirm Password */}
          <View style={{ marginBottom: 16, position: "relative" }}>
            <TextInput
              style={{
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder={t("confirm_password") || "Confirm Password"}
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={form.confirmPassword}
              onChangeText={(text) =>
                setForm({ ...form, confirmPassword: text })
              }
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 10, top: 8, padding: 5 }}
            >
              <Image
                source={
                  showPassword
                    ? require("@/assets/icons/eye.png")
                    : require("@/assets/icons/eye-hide.png")
                }
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {errors.confirmPassword && (
              <Text style={{ color: "red", marginTop: 4, textAlign:"center" }}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Terms */}
          <Text
            style={{
              fontSize: 12,
              color: colorScheme === "dark" ? "#888" : "#666",
              textAlign: "center",
              marginBottom: 14,
              lineHeight: 16,
              paddingHorizontal: 24,
            }}
          >
            {t("by")} <Text style={{ color: "#445399" }}>{t("by2")}</Text>
            <Text
              className="text-primary underline"
              onPress={() => router.push("/terms")}
            >
              {t("terms")}
            </Text>
          </Text>

          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CustomButton
              title={t("signup")}
              containerStyles={{
                backgroundColor: "#7E0201",
                borderRadius: 12,
                height: 48,
                justifyContent: "center",
              }}
              textStyles={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
              isLoading={isSubmitting}
              handlePress={handleSignUp}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colorScheme === "dark" ? "#888" : "#666",
              }}
              className="font-poppins-medium"
            >
              {t("already")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text
                style={{ fontSize: 14, color: "#445399", fontWeight: "600" }}
                className="text-primary font-poppins-medium text-[14px]"
              >
                {t("login")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.poweredBy}>
          <Text style={styles.poweredText}>Powered by </Text>
          <Text
            style={styles.poweredBold}
            onPress={() => Linking.openURL("https://activetechet.com")}
          >
            Active Technology PLC
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const responsiveSize = (size) => {
  const scaleFactor = width / 375;
  return size * scaleFactor;
};

const styles = StyleSheet.create({
  poweredBy: { alignItems: "center", marginTop: responsiveSize(10) },
  poweredText: {
    textAlign: "center",
    fontSize: responsiveSize(12),
    color: "#1f2937",
  },
  poweredBold: { fontWeight: "bold", color: "#8F3C01" },
});

export default SignUp;
