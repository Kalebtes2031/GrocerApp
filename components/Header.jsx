import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Modal,
  Animated,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "./ThemedView";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useRouter } from "expo-router";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useCart } from "@/context/CartProvider";
import { LayoutAnimation, UIManager, Platform } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Octicons from "@expo/vector-icons/Octicons";
import {
  getAccessToken,
  updateUserProfile,
  updateUserProfileImage,
} from "@/hooks/useFetch";
import axios from "axios";
import { useWatchlist } from "@/context/WatchlistProvider";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import SearchComponent from "@/components/SearchComponent";

const Header = () => {
  const { t, i18n } = useTranslation("header");
  const { watchlist } = useWatchlist();
  const route = useRouter();
  const { cart, setCart, loadCartData, removeItemFromCart } = useCart();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-420)).current; // Fix here
  const { user, setUser, isLogged, logout } = useGlobalContext();
  // State for the shopping-cart modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  // Animated value for sliding in from the right; starting off-screen (e.g., 300px to the right)
  const cartSlideAnim = useRef(new Animated.Value(300)).current;
  const [editMode, setEditMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("EN");

  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Function to toggle the modal
  const toggleModal = () => {
    if (!isModalVisible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true, // Enable native driver for better performance
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -410,
        duration: 360,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  };

  const handleLogout = () => {
    console.log("logout");
    console.log("user is : ", user);
    console.log("isLogged is : ", isLogged);
    logout();
    router.replace("/(auth)/sign-in");
  };
  useEffect(() => {
    console.log("cart is : ", cart);
  }, []);

  // Modify your handleDeleteProduct function
  const handleDeleteProduct = async (itemId) => {
    try {
      await removeItemFromCart(itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please grant access to the media library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setUser((prevUser) => ({ ...prevUser, image: newImage })); // Update UI immediately
      await uploadProfileImage(newImage);
    }
  };
  const uploadProfileImage = async (imageUri) => {
    try {
      const token = await getAccessToken();
      const formData = new FormData();

      // Check if the imageUri is local (i.e., starts with "file://")
      if (imageUri && imageUri.startsWith("file://")) {
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("image", {
          uri: imageUri,
          name: `profile.${fileType}`,
          type: `image/${fileType}`,
        });
      } else {
        console.warn("The image URI is not in the expected format:", imageUri);
        // Optionally handle non-local URIs or exit early
        return;
      }

      const response = await updateUserProfileImage(formData);

      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Upload error:", error.response || error);
      Alert.alert(
        "Upload Failed",
        "Could not upload profile image. Try again."
      );
    }
  };

  const handleLanguageToggle = () => {
    const newLangCode = currentLanguage === "EN" ? "amh" : "en";
    setCurrentLanguage(currentLanguage === "EN" ? "AM" : "EN");
    i18n.changeLanguage(newLangCode);
  };

  return (
    <SafeAreaView
      style={[
        styles.header,
        { backgroundColor: colorScheme === "dark" ? "#333" : "gray" },
      ]}
    >
      <ThemedView
        style={[
          styles.headerContainer,
          { backgroundColor: colorScheme === "dark" ? "#333" : "#fff" },
        ]}
      >
        {/* Menu and logo on the left */}
        <View style={styles.menulogo}>
          <Pressable onPress={toggleModal}>
            <Ionicons name="menu" size={34} color="#445399" />
          </Pressable>
          {/* <Image
            source={require("../assets/images/malhibfooterlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          /> */}
        </View>

        {/* Icons on the right */}
        {/* Icons on the right */}
        <View style={{position:"relative"}}>

        <ThemedView
          style={[
            styles.iconContainer,
            { backgroundColor: colorScheme === "dark" ? "#333" : "#fff" },
          ]}
        >
          <View>
            
          </View>
          <TouchableOpacity onPress={toggleSearch}>
            <MaterialIcons
              name="search"
              size={24}
              style={{ color: colorScheme === "dark" ? "#fff" : "#445399" }}
            />
          </TouchableOpacity>
          {showSearch && (
            <View style={styles.searchOverlay}>
              <SearchComponent />
            </View>
          )}

          <View style={styles.iconWrapper}>
            <TouchableOpacity
              onPress={() => route.push("/(tabs)/watchlistscreen")}
            >
              <MaterialIcons name="favorite-border" size={24} color="#445399" />
            </TouchableOpacity>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{watchlist.length}</Text>
              {/* <Text style={styles.badgeText}>0</Text> */}
            </View>
          </View>

          <TouchableOpacity onPress={() => route.push("/(tabs)/profile")}>
            <Ionicons name="person" size={24} color="#445399" />
          </TouchableOpacity>
        </ThemedView>
        </View>
      </ThemedView>

      {/* Slide-in menu Modal in left side */}
      <Modal transparent visible={isModalVisible} animationType="none">
        {/* Overlay for closing the modal */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleModal}
          activeOpacity={1}
        />
        {/* Animated Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateX: slideAnim }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            },
          ]}
        >
          <View style={{ backgroundColor: "#445399" }}>
            {/* first row */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 10,
                height: 70,
                width: "100%",
                // backgroundColor: "red",
              }}
            >
              <TouchableOpacity
                onPress={toggleModal}
                style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
                className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              {/* language */}
              {/* <View className=" flex-row gap-x-1 items-center ">
                <MaterialIcons name="language" size={24} color="#55B051" />
                <TouchableOpacity
                  onPress={handleLanguageToggle}
                  className="flex-row justify-center items-center"
                >
                  <View
                    className="bg-[#55B051] rounded-l-[10px] px-2 py-1"
                    style={{ backgroundColor: "#55B051" }}
                  >
                    <Text className="text-white text-[12px] font-poppins-medium">
                      {currentLanguage === "EN" ? "EN" : "አማ"}
                    </Text>
                  </View>
                  <View className="bg-white rounded-r-[10px] px-2 py-1">
                    <Text
                      className="text-[#55B051] text-[12px] font-poppins-medium"
                      style={{ color: "#55B051" }}
                    >
                      {currentLanguage === "EN" ? "አማ" : "EN"}
                    </Text>
                  </View>
                 
                </TouchableOpacity>
              </View> */}

              {/* sign out */}
              <TouchableOpacity onPress={handleLogout}>
                <View
                  style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
                >
                  <SimpleLineIcons name="logout" size={14} color="white" />
                  <Text className=" font-poppins-medium text-white">
                    {t("signout")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "start",
                  alignItems: "center",
                  // backgroundColor:"red",
                  marginLeft: 33,
                }}
              >
                <View style={styles.profileHeader}>
                  <TouchableOpacity
                    onPress={handleImagePick}
                    style={styles.imageContainer}
                  >
                    {user?.image ? (
                      <Image
                        source={{ uri: user.image }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Icon name="person" size={40} color="#666" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={{ position: "absolute", bottom: 10, left: 38 }}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleImagePick}
                    >
                     <Icon name="edit" size={i18n.language === "en" ? 15 : 10} color="#445399"/>

                      <Text style={styles.editButtonText}>{t("edit")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={{ color: "white" }}>
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
              <View style={{ marginRight: 10 }}>
                <LanguageToggle bgcolor="#55B051" textcolor="#55B051" />
              </View>
            </View>
          </View>
          {/* zerzer */}
          <View
            style={{
              borderTopRightRadius: 28,
              borderTopLeftRadius: 28,
              backgroundColor: "white",
              height: "100%",
              padding: 22,
              marginTop: 12,
            }}
          >
            <TouchableOpacity
              style={styles.link}
              onPress={() => route.push("order")}
            >
              <Octicons name="note" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("myorders")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <AntDesign name="setting" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("settings")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <SimpleLineIcons name="earphones-alt" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("contact")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <SimpleLineIcons name="note" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("terms")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <MaterialIcons name="question-answer" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("faq")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <MaterialIcons name="privacy-tip" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("privacy")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <MaterialIcons name="delete" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("remove")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    height: 70,
    width: "100%",
    // position: "absolute",
    // top: 0,
    // zIndex: 1000,
  },
  searchOverlay: {
    position: "absolute",
    top:28,       // adjust as needed
    right:0,   // if you want full screen overlay, or just position relative to your header
    backgroundColor: "white", // optional semi-transparent background
    // additional styling (padding, etc.) if needed
    borderRadius:43,
    width:340,
    zIndex:10,
    // padding:0,
  },
  profileHeader: {
    alignItems: "start",
    paddingHorizontal: 12,
    backgroundColor: "#445399",
    // borderBottomColor: "#445399",
    // borderBottomWidth: 3,
  },
  imageContainer: {
    marginBottom: 16,
    // backgroundColor: "white",
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 60,
    backgroundColor: "#e1e4e8",
    position: "relative",
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 60,
    backgroundColor: "#e1e4e8",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageBadge: {
    position: "absolute",
    bottom: -10,
    left: 90,
    backgroundColor: "#007bff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
    // width: 44,
    borderWidth: 1,
    borderColor: "#445399",
  },
  editButtonText: {
    color: "#445399",
    fontWeight: "500",
    fontSize: 10,
  },
  logo: {
    width: 95,
    height: 40,
    marginLeft: 12,
    marginVertical: 10,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap:10,
    width: 100,
    marginRight: 10,
    // marginTop:8,
  
  },
  iconWrapper: {
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    backgroundColor: "#445399",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    // zIndex: 10, // Ensures the badge is on top
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  menulogo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Slightly dimmed background
  },
  modalContent: {
    // width: 280,
    width: "100%",
    height: "100%",
    backgroundColor: "#445399",
    position: "absolute",
    left: 0,
    top: 0,
  },
  modalHeading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000", // Black text for heading
    padding: 20,
  },
  link: {
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: "#ddd", // Divider between links
    paddingLeft: 20,
  },
  linkText: {
    fontSize: 18,
    color: "#445399", // Black text for links
  },
  cartOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    // alignSelf: "flex-end",
  },
  cartModalContent: {
    width: 280,
    height: "100%",
    backgroundColor: "white",
    position: "absolute",
    right: 0,
    top: 0,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
});

export default Header;
