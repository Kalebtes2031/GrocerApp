import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useGlobalContext } from "@/context/GlobalProvider";
import axios from "axios";
import { getAccessToken, updateUserProfile } from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";


const ProfileScreen = () => {
  const { t, i18n } = useTranslation("profile");
  const router = useRouter();
  const { user, setUser, logout } = useGlobalContext();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    old_password: "",
    password: "",
  });

  // Sync global user data with local form state
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) error = t('invalid_email');
        break;
      case "phone":
        if (!/^(?:\+251|0)9\d{8}$/.test(value)) error = t('invalid_phone');
        break;
      case "password":
        if (value.length < 4) error = t('password_min');
        break;
      case "old_password":
        if (!value) error = t("current_password_required");
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (name, value) => {
    validateField(name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setUser((prev) => ({ ...prev, image: newImage }));
    }
  };

  const updateProfile = async (data) => {
    try {
      const token = await getAccessToken();
      const response = await axios.put(
        "https://yasonbackend.yasonsc.com/account/user/profile/update/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Update failed";
    }
  };

  // const handleSave = async () => {
  //   const validations = Object.entries(formData).map(([key, value]) =>
  //     validateField(key, value)
  //   );

  //   if (validations.every((v) => v)) {
  //     setLoading(true);
  //     try {
  //       const updatedUser = await updateProfile(formData);
  //       setUser(updatedUser);
  //       setEditMode(false);
  //     } catch (error) {
  //       setErrors({
  //         general: typeof error === "string" ? error : "Update failed",
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };
 const handleSave = async () => {
  setErrors(prev => ({ ...prev, general: "" }));

  const validations = Object.entries(formData).map(([key, value]) =>
    validateField(key, value)
  );

  if (!validations.every(v => v)) {
    return;
  }

  setLoading(true);
  try {
    const token = await getAccessToken();

    // Create FormData for image upload
    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("username", formData.username);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone_number", formData.phone_number);

    // only include password fields if the user entered a new password
    if (formData.password) {
      formDataToSend.append("old_password", formData.old_password);
      formDataToSend.append("password", formData.password);
    }

    if (user.image && user.image.startsWith("file://")) {
      const uriParts = user.image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formDataToSend.append("image", {
        uri: user.image,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    const response = await updateUserProfile(formDataToSend);

    if (response.status === 200) {
      setUser(response.data);
      setEditMode(false);
      setErrors({});

      Toast.show({
        type: "success",
        text1: t("profile_updated"),
        position: "top",
        visibilityTime: 2000,
      });
    } else {
      throw new Error("Unexpected response");
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      const data = err.response.data;
      const flatErrors = Object.fromEntries(
        Object.entries(data).map(([field, messages]) => [
          field,
          Array.isArray(messages) ? messages.join(" ") : messages,
        ])
      );
      setErrors(flatErrors);
      Object.values(flatErrors).forEach(text => {
        Toast.show({
          type: "error",
          text1: text,
          position: "top",
          visibilityTime: 3000,
        });
      });
    } else {
      const message = err.message || t("update_failed");
      setErrors({ general: message });
      Toast.show({
        type: "error",
        text1: message,
        position: "top",
        visibilityTime: 3000,
      });
    }
  } finally {
    setLoading(false);
  }
};

  if (!user)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );

  const handleLogout = () => {
    console.log("logout");
    console.log("user is : ", user);
    // console.log("isLogged is : ", isLogged);
    logout();
    router.replace("/(auth)/sign-in");
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Profile Image Section */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginHorizontal: 10,
                paddingHorizontal: 2,
                borderWidth: 1,
                borderColor: "#445399",
                borderRadius: 54,
                paddingVertical: 1,
              }}
              className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
            >
              <Ionicons name="arrow-back" size={24} color="#445399" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileHeader}>
            <TouchableOpacity
              onPress={handleImagePick}
              disabled={!editMode}
              style={styles.imageContainer}
            >
              {user.image ? (
                <Image
                  source={{ uri: user.image }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Icon name="person" size={40} color="#666" />
                </View>
              )}
              {editMode && (
                <View style={styles.editImageBadge}>
                  <Icon name="edit" size={18} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.editButton, editMode && styles.cancelButton]}
                onPress={() => setEditMode(!editMode)}
              >
                <Text
                  className="font-poppins-medium"
                  style={styles.editButtonText}
                >
                  {editMode ? t("cancel") : t("edit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => handleLogout()}
              >
                <Text
                  style={styles.logoutButtonText}
                  className="font-poppins-medium"
                >
                  {t("signout")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainers}>
            <View style={styles.nameContainer}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}
              >
                <Text
                  className="font-poppins-medium"
                  style={[styles.inputLabel, { marginLeft: 6 }]}
                >
                  {t("first_name")}
                </Text>
                <TextInput
                  value={formData.first_name}
                  onChangeText={(v) => handleChange("first_name", v)}
                  style={editMode ? styles.input1 : styles.input}
                  editable={editMode}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text
                  className="font-poppins-medium"
                  style={[styles.inputLabel, { marginLeft: 8 }]}
                >
                  {t("last_name")}
                </Text>
                <TextInput
                  value={formData.last_name}
                  onChangeText={(v) => handleChange("last_name", v)}
                  style={editMode ? styles.input1 : styles.input}
                  editable={editMode}
                />
              </View>
            </View>

            {["username", "email", "phone_number"].map((key) => (
              <View key={key} style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {t(key)} {/* translate the label */}
                </Text>
                <TextInput
                  value={formData[key]}
                  onChangeText={(v) => handleChange(key, v)}
                  style={editMode ? styles.input1 : styles.input}
                  editable={editMode}
                  keyboardType={
                    key === "email"
                      ? "email-address"
                      : key === "phone_number"
                      ? "phone-pad"
                      : "default"
                  }
                />
                {errors[key] && (
                  <Text style={styles.errorText}>{errors[key]}</Text>
                )}
              </View>
            ))}

            {/* Current Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("current_password")}</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  name="old_password"
                  secureTextEntry={!showPassword}
                  value={formData.old_password}
                  onChangeText={(v) => handleChange("old_password", v)}
                  editable={editMode}
                  style={[
                    styles.input,
                    editMode ? styles.inputActive : styles.inputDisabled,
                    errors.old_password && styles.inputError,
                  ]}
                />
                {editMode && (
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <MaterialCommunityIcons
                        name="eye"
                        size={20}
                        color="#666"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="eye-off"
                        size={20}
                        color="#666"
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              {errors.old_password && (
                <Text style={styles.errorText}>
                  {errors.old_password.replace("_", " ")}
                </Text>
              )}
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("new_password")}</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  name="password"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(v) => handleChange("password", v)}
                  editable={editMode}
                  style={[
                    styles.input,
                    editMode ? styles.inputActive : styles.inputDisabled,
                  ]}
                />
                {editMode && (
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <MaterialCommunityIcons
                        name="eye"
                        size={20}
                        color="#666"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="eye-off"
                        size={20}
                        color="#666"
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              {errors.password && (
                <Text style={styles.errorText}>
                  {errors.password.replace("_", " ")}
                </Text>
              )}
            </View>
            
            {errors.general && (
              <Text className="font-poppins-medium" style={styles.errorText}>
                {errors.general}
              </Text>
            )}

            {editMode && (
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    className="font-poppins-medium"
                    style={styles.buttonText}
                  >
                    {t("save")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  passwordWrapper: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  headerContainer: {
    paddingTop: 8,
    width: "16%",
    // height: 60,
    backgroundColor: "#fff",
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#55B051",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 32,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#e1e4e8",
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#e1e4e8",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#445399",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#445399",
  },
  editButtonText: {
    color: "white",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  nameContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    color: "#6c757d",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 58,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#ccc",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  input1: {
    backgroundColor: "#f8f9fa",
    borderRadius: 58,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#212529",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  button: {
    backgroundColor: "#445399",
    borderRadius: 58,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    // opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    width: "100%",
    textAlign: "center",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileScreen;
