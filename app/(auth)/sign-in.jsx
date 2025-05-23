import { useState, useEffect } from "react";
import { Link } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import {
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Entypo, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useGlobalContext } from "@/context/GlobalProvider";
import { GET_AUTH, USER_PROFILE } from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const SignIn = () => {
  const { t, i18n } = useTranslation("signin");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({
    login: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentLanguage, setCurrentLanguage] = useState("EN");

  const submit = async () => {
    if (!form.login || !form.password) {
      return Toast.show({
        type: "info",
        text1: t("fill"),
      });
    }

    setIsSubmitting(true);
    try {
      const result = await GET_AUTH({
        login: form.login,
        password: form.password,
      });
      console.log("Auth response:", result); // Check response structure

      // Store both tokens
      await AsyncStorage.multiSet([
        ["accessToken", result.access],
        ["refreshToken", result.refresh],
      ]);

      // Fetch user profile after successful login
      const profile = await USER_PROFILE();
      console.log("User profile:", profile);

      // Update global context
      setUser(profile);
      setIsLogged(true);

      // Immediate navigation
      console.log("Navigating to home...");
      router.replace("/(tabs)/home");

      // Update context after navigation
      // setUser({ username: form.username });

      setIsLogged(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Authentication failed",
        text2: extractErrorDetails(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };
 const extractErrorDetails = (error) => {
    if (error?.response?.data) {
      const data = error.response.data;

      // If it's a simple error message
      if (typeof data === "string") return data;

      // If it's a dict of field-specific errors
      const messages = Object.entries(data)
        .map(
          ([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
        )
        .join("\n");

      return messages || "An unknown error occurred.";
    }
    return "An unknown error occurred.";
  };
  useEffect(() => {
    async function checkOnboarding() {
      const check = await SecureStore.getItemAsync("onboardingCompleted");
      console.log("onboardingCompleted:", check);

      if (check === "true") {
        await SecureStore.deleteItemAsync("onboardingCompleted");
        console.log("Onboarding completed, deleting key.");
      }
    }
    checkOnboarding();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Upper Section */}
      <View style={styles.upperContainer}>
        <Image
          source={require("@/assets/images/signup.png")}
          style={styles.backgroundImage}
        />
        <View style={styles.overlay} />

        {/* Language Selector */}
        <View style={styles.languageContainer}>
          <MaterialIcons
            name="language"
            size={responsiveSize(24)}
            color="#445399"
          />
          <LanguageToggle bgcolor="#55B051" textcolor="#55B051" />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/yasonlogo.png")}
            style={styles.logo}
          />
        </View>
      </View>

      {/* Lower Section */}
      <View style={styles.lowerContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>{t("signin_with")}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t("username_or_email")}
              placeholderTextColor="#888"
              value={form.login}
              onChangeText={(e) => setForm({ ...form, login: e })}
            />
          </View>

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            leftIcon={
              <FontAwesome
                name="lock"
                size={responsiveSize(16)}
                color="#6b7280"
              />
            }
            containerStyles={styles.passwordInput}
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={styles.forgotText}>{t("forgot")}</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={t("signin")}
              handlePress={submit}
              containerStyles={styles.button}
              isLoading={isSubmitting}
              disabled={isSubmitting}  
            />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{t("dont")} </Text>
            <Link href="/sign-up" style={styles.signupLink}>
              {t("title")}
            </Link>
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
      </View>
    </SafeAreaView>
  );
};

// Responsive size calculation
const responsiveSize = (size) => {
  const scaleFactor = width / 375; // Base width from design (e.g., iPhone 375)
  return size * scaleFactor;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  upperContainer: {
    height: responsiveSize(250),
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: 300,
    position: "absolute",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  languageContainer: {
    position: "absolute",
    top: responsiveSize(32),
    right: responsiveSize(16),
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: responsiveSize(128),
    height: responsiveSize(128),
    resizeMode: "contain",
  },
  lowerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: responsiveSize(34),
    borderTopRightRadius: responsiveSize(34),
    marginTop: -responsiveSize(28),
    flex: 1,
    paddingHorizontal: responsiveSize(24),
    paddingVertical: responsiveSize(12),
  },
  scrollContent: {
    paddingBottom: responsiveSize(10),
  },
  title: {
    fontSize: responsiveSize(22),
    fontFamily: "Poppins-Medium",
    color: "#111827",
    marginTop: responsiveSize(10),
    textAlign: "center",
  },
  inputContainer: {
    paddingHorizontal: responsiveSize(16),
    // paddingVertical: responsiveSize(2),
    borderWidth: 1,
    borderColor: "#445399",
    borderRadius: responsiveSize(100),
    marginBottom: responsiveSize(25),
    marginTop: responsiveSize(16),
  },
  input: {
    fontSize: responsiveSize(16),
    color: "#445399",
  },
  passwordInput: {
    marginBottom: responsiveSize(24),
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginRight: responsiveSize(8),
    marginBottom: responsiveSize(22),
  },
  forgotText: {
    color: "#445399",
    fontFamily: "Poppins-Medium",
    fontSize: responsiveSize(14),
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#7E0201",
    borderRadius: responsiveSize(12),
    height: responsiveSize(48),
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    width: "80%",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: responsiveSize(24),
    marginBottom: responsiveSize(50),
  },
  signupText: {
    color: "#4b5563",
    fontFamily: "Poppins-Regular",
    fontSize: responsiveSize(14),
  },
  signupLink: {
    color: "#445399",
    fontFamily: "Poppins-Bold",
    fontSize: responsiveSize(16),
  },
  poweredBy: {
    alignItems: "center",
    marginTop: responsiveSize(10),
  },
  poweredText: {
    textAlign: "center",
    fontSize: responsiveSize(12),
    color: "#1f2937",
  },
  poweredBold: {
    fontWeight: "bold",
    color: "#8F3C01",
  },
});

export default SignIn;
