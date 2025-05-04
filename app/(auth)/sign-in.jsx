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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Entypo, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useGlobalContext } from "@/context/GlobalProvider";
import { GET_AUTH, USER_PROFILE } from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";


const SignIn = () => {
  const { t, i18n } = useTranslation('signin');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentLanguage, setCurrentLanguage] = useState("EN");

  const submit = async () => {
    if (!form.username || !form.password) {
      return Toast.show({
        type: "info",
        text1: "Please fill all fields",
      });
    }

    setIsSubmitting(true);
    try {
      const result = await GET_AUTH(form);
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
        text2: "Invalid credentials or server error",
      });
    } finally {
      setIsSubmitting(false);
    }
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
    <SafeAreaView className="flex-1 bg-primary">
      {/* Upper Section with Background Image */}
      <View className="h-[45%] relative" style={{height:200}}>
        <Image
          source={require("@/assets/images/signup.png")}
          className="w-full h-full absolute"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-white/80" />

        {/* Language Selector */}
        <View className="absolute top-8 right-4 flex-row gap-x-1 items-center ">
          <MaterialIcons name="language" size={24} color="#445399" />
          <LanguageToggle bgcolor="#445399" textcolor="#445399" />
          {/* <TouchableOpacity
            onPress={() =>
              setCurrentLanguage((prev) => (prev === "EN" ? "AM" : "EN"))
            }
            className="flex-row justify-center items-center"
          >
            <View className="bg-primary rounded-l-[10px] px-2 py-1">
              <Text className="text-white text-[12px] font-poppins-medium">
                {currentLanguage === "EN" ? "EN" : "አማ"}
              </Text>
            </View>
            <View className="bg-white rounded-r-[10px] px-2 py-1">
              <Text className="text-primary text-[12px] font-poppins-medium">
                {currentLanguage === "EN" ? "አማ" : "EN"}
              </Text>
            </View>
            {/* <Text className="text-white text-[12px] ml-2 font-poppins-medium">
              {currentLanguage === "EN" ? "EN | አማ" : "አማ | EN"}
            </Text> */}
          {/* </TouchableOpacity> */} 
        </View>

        {/* Logo */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/yasonlogo.png")}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Lower Section with Form */}
      <View className="bg-white rounded-t-3xl -mt-24 flex-1 px-6 py-8">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-3xl font-poppins-medium text-gray-900 mb-8">
            {t('signin')}
          </Text>
          <View className="px-4 py-5 border border-primary rounded-full mb-12 mt-4 border-xl">
            <TextInput
              // style={styles.input}
              placeholder={t('username')}
              value={form.username}
              onChangeText={(e) => setForm({ ...form, username: e })}
              placeholderTextColor="#888"
            />
          </View>

          {/* <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            leftIcon={<MaterialIcons name="person" size={24} color="#6b7280" />}
            containerStyles="mb-28 border border-primary"
            placeholder="Username"
          /> */}

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            leftIcon={<FontAwesome name="lock" size={24} color="#6b7280" />}
            containerStyles="mb-6"
            // secureTextEntry
            placeholder="••••••••"
          />

          <TouchableOpacity 
            className="items-end mt-6 mr-2 mb-8"
            onPress={()=>router.push('/(auth)/forgot-password')}  
          >
            <Text className="text-primary font-poppins-medium">
              {t('forgot')}
            </Text>
          </TouchableOpacity>
            <View
              style={{flex: 1, justifyContent: "center", alignItems: "center"}}
            >


          <CustomButton
            title={t('signin')}
            handlePress={submit}
            containerStyles={{
              backgroundColor: "#7E0201",
              borderRadius: 12,
              height: 48,
              justifyContent: "center",
            }}
            isLoading={isSubmitting}
          />
            </View>

          {/* <View className="flex-row items-center gap-3 my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-500 font-poppins-medium">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View> */}

          {/* <View className="flex-row justify-center gap-4">
            <TouchableOpacity className="p-3 border border-gray-200 rounded-full">
              <Image
                source={require("@/assets/icons/google.png")}
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <TouchableOpacity className="p-3 border border-gray-200 rounded-full">
              <Image
                source={require("@/assets/icons/apple.png")}
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View> */}

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 font-poppins-regular">
              {t('dont')}{" "}
            </Text>
            <Link href="/sign-up" className="text-primary font-poppins-bold">
              {t('title')}
            </Link>
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
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
