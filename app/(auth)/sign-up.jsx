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
} from "react-native";
import CustomButton from "@/components/CustomButton";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { ThemedText } from "@/components/ThemedText";
import Toast from "react-native-toast-message";

import * as Font from "expo-font";
import { CREATE_NEW_CUSTOMER } from "@/hooks/useFetch";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const SignUp = () => {
  const { t, i18n } = useTranslation('signup');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
  });
  // Add this in your component
  // useEffect(() => {
  //   const checkFonts = async () => {
  //     const fonts = await Font.getAvailableFontsAsync();
  //     console.log('Available fonts:', fonts);
  //   };
  //   checkFonts();
  // }, []);

  const colorScheme = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    // Basic form validation
    if (
      !form.firstName ||
      !form.lastName ||
      !form.phoneNumber ||
      !form.username ||
      !form.email ||
      !form.password
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill all required fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map form fields to API expected format
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
        Toast.show({
          type: "success",
          text1: "Account created successfully!",
        });

        // Reset form
        setForm({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          username: "",
          email: "",
          password: "",
        });

        // Redirect to login after short delay
        setTimeout(() => router.push("/sign-in"), 1500);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: error.response?.data?.message || "Please check your information",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 24,
        }}
      >
       
        {/* Hero Image */}
        <Image
          source={require("@/assets/images/signup.png")}
          resizeMode="cover"
          style={{
            width: "100%",
            height: 240,
          }}
        />
        <View className="absolute inset-0 bg-white/20" />
          <View className="absolute top-8 right-4 flex-row gap-x-1 items-center ">
            <LanguageToggle bgcolor="#445399" textcolor="#445399" />
          </View>
        {/* Form Container */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -44,
          }}
        >
          <Text
            // style={{
            //   fontSize: 20,
            //   fontWeight: "700",
            //   // color: colorScheme === "dark" ? "#fff" : "#000",
            //   marginBottom: 16,
            //   fontFamily:"",
            // }}
            className="text-primary text-[20px] font-poppins-medium mb-4"
          >
            {t("title")}
          </Text>

          {/* Name Row */}
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                // backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                // borderRadius: 12,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
                // width:33,
              }}
              placeholder={t("first_name")}
              placeholderTextColor="#888"
              value={form.firstName}
              onChangeText={(text) => setForm({ ...form, firstName: text })}
            />

            <TextInput
              // style={{
              //   flex: 1,
              //   backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              //   borderRadius: 12,
              //   padding: 14,
              //   fontSize: 14,
              //   color: colorScheme === "dark" ? "#fff" : "#000",
              //   height: 48,
              // }}
              style={{
                flex: 1,
                // backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                // borderRadius: 12,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                paddingLeft: 16,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
              }}
              placeholder={t("last_name")}
              placeholderTextColor="#888"
              value={form.lastName}
              onChangeText={(text) => setForm({ ...form, lastName: text })}
            />
          </View>

          {/* Phone Number */}
          <TextInput
            // style={{
            //   backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
            //   borderRadius: 12,
            //   padding: 14,
            //   fontSize: 14,
            //   color: colorScheme === "dark" ? "#fff" : "#000",
            //   marginBottom: 20,
            //   height: 48,
            // }}
            style={{
              flex: 1,
              // backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
              // borderRadius: 12,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
              padding: 14,
              paddingLeft: 16,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              height: 48,
              marginBottom: 20,
            }}
            placeholder={t('phone_number')}
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
          />

          {/* Username */}
          <TextInput
            style={{
              flex: 1,
              // backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
              // borderRadius: 12,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
              padding: 14,
              paddingLeft: 16,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              height: 48,
              marginBottom: 20,
            }}
            placeholder={t('username')}
            placeholderTextColor="#888"
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
          />

          {/* Email */}
          <TextInput
             style={{
              flex: 1,
              // backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
              // borderRadius: 12,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
              padding: 14,
              paddingLeft: 16,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              height: 48,
              marginBottom: 20,
            }}
            placeholder={t('email')}
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />

          {/* Password */}
          {/* <TextInput
            style={{
              backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 16,
              height: 48,
            }}
            placeholder="Create password"
            placeholderTextColor="#888"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          /> */}

          <View style={{ marginBottom: 10, position: "relative" }}>
            <TextInput
               style={{
                flex: 1,
                // backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
                backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFF",
                // borderRadius: 12,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#1E1E1E" : "#445399",
                padding: 14,
                paddingLeft: 16,
                fontSize: 14,
                color: colorScheme === "dark" ? "#fff" : "#000",
                height: 48,
                // marginBottom: 20,
              }}
              placeholder={t('password')}
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: 8,
                padding: 5,
              }}
            >
              <Image
                source={
                  showPassword
                    ? require("@/assets/icons/eye.png") // Icon when password is visible
                    : require("@/assets/icons/eye-hide.png") // Icon when password is hidden
                }
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {/* Terms Text */}
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
            {t('by')}{" "}
            <Text
              // style={{
              //   color: "#7E0201",
              //   textDecorationLine: "underline",
              // }}
              className="text-primary underline"
              onPress={() => router.push("/terms")}
            >
              {t('terms')}
            </Text>
          </Text>
        <View
                      style={{flex: 1, justifyContent: "center", alignItems: "center"}}
                    >


          {/* Sign Up Button */}
          <CustomButton
            title={t("signup")}
            containerStyles={{
              backgroundColor: "#7E0201",
              borderRadius: 12,
              height: 48,
              justifyContent: "center",
            }}
            textStyles={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "600",
            }}
            isLoading={isSubmitting}
            handlePress={handleSignUp}
          />
                      </View>    

          {/* Login Link */}
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
              {t('already')}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text
                // style={{
                //   fontSize: 14,
                //   color: "#7E0201",
                //   fontWeight: "600",
                // }}
                className="text-primary font-poppins-medium text-[14px]"
              >
                {t('login')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ alignItems: "center", marginTop: 10 }}>
                            <Text
                              style={{
                                textAlign: "center",
                                color: colorScheme === "dark" ? "#fff" : "#000",
                                fontSize: 12,
                              }}
                            >
                              Powered by{" "}
                              <Text style={{ fontWeight: "bold" }}>Active Technology</Text>
                            </Text>
                          </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
