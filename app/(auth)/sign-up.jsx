import { useEffect, useState, useRef } from "react";
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
  ActivityIndicator,
  Animated,
} from "react-native";
import CustomButton from "@/components/CustomButton";
import CheckBox from "@react-native-community/checkbox";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import Toast from "react-native-toast-message";
import * as Font from "expo-font";
import {
  CREATE_NEW_CUSTOMER,
  POST_GOOGLE_AUTH,
  USER_PROFILE,
} from "@/hooks/useFetch";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalContext } from "@/context/GlobalProvider";

const { width } = Dimensions.get("window");

const SignUp = () => {
  const { t, i18n } = useTranslation("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    // firstName: "",
    // lastName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const colorScheme = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, setIsLogged } = useGlobalContext();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const confirmOpacity = useRef(new Animated.Value(0)).current;
  const confirmHeight = useRef(new Animated.Value(0)).current;

  const scaleValue = new Animated.Value(0);
  const animateCheckbox = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // Do this once on app load
  GoogleSignin.configure({
    // This is your Android OAuth client ID from app.json → extra.androidClientId
    webClientId: Constants.expoConfig.extra.webClientId,
    offlineAccess: false, // set true if you need a server refresh token
    forceCodeForRefreshToken: false,
  });

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      await GoogleSignin.signOut(); // clears the cached session

      await GoogleSignin.signIn(); // native UI

      // Pull the tokens, including idToken
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error("No ID token returned");

      const tokens = await POST_GOOGLE_AUTH({ id_token: idToken });

      await AsyncStorage.multiSet([
        ["accessToken", tokens.access_token],
        ["refreshToken", tokens.refresh_token],
      ]);
      const profile = await USER_PROFILE();
      setUser(profile);
      setIsLogged(true);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Google signin error", error);
      Toast.show({
        type: "error",
        text1: "Google Sign-In Failed",
        text2: error.message || "Please try again.",
      });
    } finally {
      setLoadingGoogle(false);
    }
  };

  const termsUrl =
    i18n.language === "en"
      ? "https://yasonsc.com/terms_and_conditions"
      : "https://yasonsc.com/terms_and_conditions_amh";

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
    if (!isChecked) {
      Toast.show({
        type: "error",
        text1: t("terms_required"),
        visibilityTime: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        // first_name: form.firstName,
        // last_name: form.lastName,
        phone_number: form.phoneNumber,
        username: form.username,
        email: form.email,
        password: form.password,
      };
      const response = await CREATE_NEW_CUSTOMER(payload);
      if (response) {
        Toast.show({ type: "success", text1: t("account_created") });
        setForm({
          // firstName: "",
          // lastName: "",
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

  useEffect(() => {
    if (form.password.length > 0 && !showConfirm) {
      setShowConfirm(true);
      Animated.parallel([
        Animated.timing(confirmHeight, {
          toValue: 64, // Enough to contain the TextInput and padding
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(confirmOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [form.password]);

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 4 }}>
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
              fontFamily: "Poppins-Medium",
            }}
            className="text-primary text-[20px] font-poppins-medium mb-4"
          >
            {t("title")}
          </Text>

          {/* Name Row */}
          {/* <View style={{ flexDirection: "row", gap: 16, marginBottom: 20 }}>
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
                <Text
                  style={{ color: "red", marginTop: 4, textAlign: "center" }}
                >
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
                <Text
                  style={{ color: "red", marginTop: 4, textAlign: "center" }}
                >
                  {errors.lastName}
                </Text>
              )}
            </View>
          </View> */}

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
              <Text style={{ color: "red", marginTop: 4, textAlign: "center" }}>
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
              <Text style={{ color: "red", marginTop: 4, textAlign: "center" }}>
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
              <Text style={{ color: "red", marginTop: 4, textAlign: "center" }}>
                {errors.email}
              </Text>
            )}
          </View>

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
              <Text style={{ color: "red", marginTop: 4, textAlign: "center" }}>
                {errors.password}
              </Text>
            )}
          </View>

          {/* Confirm Password (Animated) */}
          <Animated.View
            style={{
              // marginBottom: 16,
              position: "relative",
              overflow: "hidden",
              height: confirmHeight,
              opacity: confirmOpacity,
            }}
          >
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
              <Text style={{ color: "red", marginTop: 4, textAlign: "center" }}>
                {errors.confirmPassword}
              </Text>
            )}
          </Animated.View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsChecked(!isChecked)}
          >
            <View style={[styles.checkbox, isChecked && styles.checkedBox]}>
              {isChecked && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text
              style={[
                styles.label,
                colorScheme === "dark" ? styles.labelDark : styles.labelLight,
              ]}
            >
              {t("by")}{" "}
              <Text
                onPress={() => Linking.openURL(termsUrl)}
                style={styles.link}
              >
                {t("by2")}
              </Text>{" "}
              <Text  >
                {t("terms")}
              </Text>
            </Text>
          </TouchableOpacity>

          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CustomButton
              title={t("signup")}
              containerStyles={{
                backgroundColor: "#7E0201",
                borderRadius: 12,
                height: 50,
                justifyContent: "center",
              }}
              textStyles={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
              isLoading={isSubmitting}
              handlePress={handleSignUp}
            />
          </View>
          {/* Horizontal Divider with "OR" */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 24,
              marginHorizontal: 16,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "#e2e8f0",
              }}
            />
            <Text
              style={{
                color: "#94a3b8",
                fontSize: 14,
                fontWeight: "500",
                marginHorizontal: 12,
                letterSpacing: 0.5,
              }}
            >
              {t("or")}
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "#e2e8f0",
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleGoogleLogin}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              backgroundColor: "#fff",
              borderRadius: 32,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#445399",
              // marginTop: 16,
            }}
          >
            {loadingGoogle ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                {/* <AntDesign
                  name="google"
                  size={20}
                  color="#445399"
                  style={{ marginRight: 8 }}
                /> */}
                <Image
                  source={require("@/assets/images/google1.jpg")}
                  resizeMode="cover"
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
                <Text style={{ color: "#445399", fontWeight: "500" }}>
                  {t("continue")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 8,
              gap: 4,
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
checkboxContainer: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 20,
  width: "100%",
  paddingHorizontal: 10,
},
checkbox: {
  width: 24,
  height: 24,
  borderWidth: 2,
  borderColor: "#445399",
  borderRadius: 5,
  marginRight: 12,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  // elevation: 2,
},
checkedBox: {
  backgroundColor: "#445399",
  borderColor: "#445399",
},
label: {
  fontSize: 14,
  textAlign: "left",
  lineHeight: 20,
  flex: 1,
  flexWrap: "wrap",
},
labelLight: {
  color: "#666",
},
labelDark: {
  color: "#888",
},
link: {
  color: "#445399",
  textDecorationLine: "underline",
  fontWeight: "500",
},
  poweredBy: { alignItems: "center", marginTop: responsiveSize(28) },
  poweredText: {
    textAlign: "center",
    fontSize: responsiveSize(12),
    color: "#1f2937",
  },
  poweredBold: { fontWeight: "bold", color: "#8F3C01" },
});

export default SignUp;
