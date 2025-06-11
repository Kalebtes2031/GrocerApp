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
  BackHandler,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
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
  deleteAccount,
  removeTokens,
} from "@/hooks/useFetch";
import axios from "axios";
import { useWatchlist } from "@/context/WatchlistProvider";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import SearchComponent from "@/components/SearchComponent";
import Toast from "react-native-toast-message";

const screenHeight = Dimensions.get("window").height;
const MENU_WIDTH = 420;
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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  //  const [isMenuVisible, setMenuVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  const handleCall = () => Linking.openURL("tel:+251952999998");
  const handleCall2 = () => Linking.openURL("tel:+251952999997");
  const handleEmail = () =>
    Linking.openURL("mailto:info@yasonsc.com?subject=Contact%20Us");
  const handleSocial = (url) => () => Linking.openURL(url);

  const handleDeletePress = () => {
    setConfirmVisible(true);
  };
const termsUrl =
    i18n.language === 'en'
      ? 'https://yasonsc.com/terms_and_conditions'
      : 'https://yasonsc.com/terms_and_conditions_amh';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      Toast.show({ type: "success", text1: "Account deactivated" });

      removeTokens();
      setUser(null);
      route.replace("/(auth)/sign-in");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not deactivate account.",
      });
    } finally {
      setLoading(false);
      setConfirmVisible(false);
    }
  };
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Function to toggle the modal
  // const toggleModal = () => {
  //   if (isMenuOpen) {
  //     setModalVisible(true);
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 420,
  //       useNativeDriver: true, // Enable native driver for better performance
  //     }).start(() => setModalVisible(false));
  //   } else {
  //     setMenuOpen(true);
  //     setModalVisible(true);
  //     Animated.timing(slideAnim, {
  //       toValue: -410,
  //       duration: 360,
  //       useNativeDriver: true,
  //     }).start(() => setModalVisible(false));
  //   }
  // };

  const handleLogout = () => {
    console.log("logout");
    console.log("user is : ", user);
    console.log("isLogged is : ", isLogged);
    logout();
    router.replace("/(auth)/sign-in");
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
  const screenWidth = Dimensions.get('window').width;
  const contactSlideAnim = useRef(new Animated.Value(screenHeight)).current;

  // Open menu
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };
  const openContact = () => {
  setContactVisible(true);
  Animated.timing(contactSlideAnim, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }).start();
};

// Close: slide out to the right again
const closeContact = () => {
  Animated.timing(contactSlideAnim, {
    toValue: screenWidth,
    duration: 200,
    useNativeDriver: true,
  }).start(() => {
    setContactVisible(false);
  });
};
  // Close menu
  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -MENU_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  // Handle Android back
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const onBack = () => {
      if (confirmVisible) {
        setConfirmVisible(false);
        return true;
      }
      if (menuVisible) {
        closeMenu();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, [menuVisible, confirmVisible]);

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      removeTokens();
      setUser(null);
      Toast.show({ type: "success", text1: "Account deactivated" });
      router.replace("/(auth)/sign-in");
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not deactivate account.",
      });
    } finally {
      setLoading(false);
      setConfirmVisible(false);
    }
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
          <TouchableOpacity onPress={menuVisible ? closeMenu : openMenu}>
            <Ionicons name="menu" size={32} color="#445399" />
          </TouchableOpacity>
          {/* <Image
            source={require("../assets/images/malhibfooterlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          /> */}
        </View>

        {/* Icons on the right */}
        {/* Icons on the right */}
        <View style={{ position: "relative" }}>
          <ThemedView
            style={[
              styles.iconContainer,
              { backgroundColor: colorScheme === "dark" ? "#333" : "#fff" },
            ]}
          >
            <View></View>
            <TouchableOpacity onPress={toggleSearch}>
              <MaterialIcons
                name="search"
                size={24}
                style={{ color: colorScheme === "dark" ? "#fff" : "#445399" }}
              />
            </TouchableOpacity>
            {/* {showSearch && (
              <View style={styles.searchOverlay}>
                <SearchComponent />
              </View>
            )} */}
{showSearch && (
  <>
    {/* Invisible pressable background */}
    <Pressable
      onPress={() => setShowSearch(false)}
      style={StyleSheet.absoluteFillObject}
    />

    {/* Actual Search Component on top */}
    <View style={styles.searchOverlay}>
      <SearchComponent />
    </View>
  </>
)}

            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={() => route.push("/(tabs)/watchlistscreen")}
              >
                <MaterialIcons
                  name="favorite-border"
                  size={24}
                  color="#445399"
                />
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
      {menuVisible && (
        <Modal transparent animationType="none">
          {/* dark overlay */}
          <TouchableOpacity
            style={styles.overlay}
            onPress={closeMenu}
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
                  onPress={closeMenu}
                  style={{
                    marginHorizontal: 10,
                    paddingHorizontal: 2,
                    borderWidth: 1,
                    borderColor: "white",
                    borderRadius: 54,
                    paddingVertical: 1,
                  }}
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
                    style={{
                      flexDirection: "row",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ color: "white" }}
                      className=" font-poppins-medium text-white"
                    >
                      {t("signout")}
                    </Text>
                    <Feather name="log-out" size={14} color="white" />
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
                    <View
                      style={{ position: "absolute", bottom: 10, left: 32 }}
                    >
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleImagePick}
                      >
                        <Icon
                          name="edit"
                          size={i18n.language === "en" ? 15 : 10}
                          color="#445399"
                        />

                        <Text
                          style={{
                            color: "#445399",
                            fontWeight: "500",
                            fontSize: i18n.language === "en" ? 10 : 9,
                          }}
                        >
                          {t("edit")}
                        </Text>
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
              {/* <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <AntDesign name="setting" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("settings")}
              </Text>
            </TouchableOpacity> */}
              <TouchableOpacity style={styles.link} onPress={() => openContact()}>
                <SimpleLineIcons
                  name="earphones-alt"
                  size={24}
                  color="#445399"
                />
                <Text className="font-poppins-mediu" style={styles.linkText}>
                  {t("contact")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.link}
                // onPress={() => route.push("home")}
                onPress={() => Linking.openURL(termsUrl)}
              >
                <SimpleLineIcons name="note" size={24} color="#445399" />
                <Text className="font-poppins-mediu" style={styles.linkText}>
                  {t("terms")}
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <MaterialIcons name="question-answer" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("faq")}
              </Text>
            </TouchableOpacity> */}
              {/* <TouchableOpacity
              style={styles.link}
              // onPress={() => route.push("home")}
            >
              <MaterialIcons name="privacy-tip" size={24} color="#445399" />
              <Text className="font-poppins-mediu" style={styles.linkText}>
                {t("privacy")}
              </Text>
            </TouchableOpacity> */}
              <TouchableOpacity style={styles.link} onPress={handleDeletePress}>
                <MaterialIcons name="delete" size={24} color="#445399" />
                <Text className="font-poppins-mediu" style={styles.linkText}>
                  {t("remove")}
                </Text>
              </TouchableOpacity>
            </View>
           <View style={styles.versionBadge}>
    <Text style={styles.versionText}>V.1.0.0</Text>
  </View>
          </Animated.View>
        </Modal>
      )}
      <Modal
  transparent
  visible={contactVisible}      // ← tell the Modal to actually show
  animationType="none"
>
          {/* dark backdrop */}
          <TouchableOpacity
            style={styles.contactOverlay}
            onPress={closeContact}
            activeOpacity={1}
          />

          {/* full-screen sliding panel */}
          <Animated.View
  style={[
    styles.contactPanel,
    { transform: [{ translateX: contactSlideAnim }] },
  ]}
>
            {/* Header */}
            <View style={styles.contactHeader}>
              <TouchableOpacity
                onPress={closeContact}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.contactTitle}> {t("contact")}</Text>
              <View style={{marginRight:24}}></View>
            </View>

            {/* Body */}
            <View style={styles.contactBody}>
              <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                <Ionicons name="call" size={28} color="#445399" />
                <Text style={styles.contactRowText}>+251 952999998</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactRow,{ marginLeft:32}]} onPress={handleCall2}>
                {/* <Ionicons name="call" size={28} color="#445399" /> */}
                <Text style={styles.contactRowText}>+251 952999997</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
                <Ionicons name="mail" size={28} color="#445399" />
                <Text style={styles.contactRowText}>info@yasonsc.com</Text>
              </TouchableOpacity>
            </View>
            <View style={{marginTop:320}}>

            </View>

            {/* Footer */}
            <View style={styles.contactFooter}>
              <TouchableOpacity 
              // onPress={handleSocial("https://facebook.com/")}
              >
                <FontAwesome name="facebook-square" size={36} color="#445399" />
              </TouchableOpacity>
              <TouchableOpacity 
              onPress={handleSocial("https://tiktok.com/@yason.asbeza?_t=ZM-8whuIMb9qcw&_r=1")}
              >
                <FontAwesome5 name="tiktok" size={36} color="#445399" />
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={handleSocial("https://t.me/+Jy3gwzdJRIM3MjJk")}
              >
                <FontAwesome name="telegram" size={36} color="#445399" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
     

      <Modal transparent visible={confirmVisible} animationType="fade">
  {/* full-screen container */}
  <View style={{ flex: 1 }}>
    {/* backdrop */}
    <TouchableOpacity
      style={styles.overlay}
      onPress={() => setConfirmVisible(false)}
      activeOpacity={1}
    />

    {/* confirmation box above the overlay */}
    <View style={styles.confirmBox}>
      <Text style={styles.confirmTitle}>{t("sure")}?</Text>
      <View style={styles.confirmActions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setConfirmVisible(false)}
          disabled={loading}
        >
          <Text>{t("cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          <Text style={styles.confirmBtnText}>
            {loading ? t("wait") : t("yes")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   searchOverlay: {
    position: "absolute",
    top: 28, // adjust as needed
    right: 0, // if you want full screen overlay, or just position relative to your header
    backgroundColor: "white", // optional semi-transparent background
    // additional styling (padding, etc.) if needed
    borderRadius: 43,
    width: 340,
    zIndex: 10,
    // padding:0,
  },
  versionBadge: {
  position: 'absolute',
  bottom: 20,
  left: 0,
  right: 0,
  alignItems: 'center',
},
versionText: {
  color: '#445399',
  fontSize: 14,
},
 contactOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
},
 overlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
},
contactPanel: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: screenHeight,
  backgroundColor: 'white',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
},
contactHeader: {
  height: 70,
  backgroundColor: '#445399',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent:"space-between",
  paddingHorizontal: 16,
},
backButton: {
  marginRight: 12,
  padding: 4,
  borderWidth:1,
  borderColor:"white",
  borderRadius:55,

},
contactTitle: {
  color: 'white',
  fontSize: 20,
  fontWeight: '600',
},
contactBody: {
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 24,
},
contactRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 16,
},
contactRowText: {
  marginLeft: 12,
  fontSize: 18,
  color: '#333',
},
contactFooter: {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  paddingVertical: 24,
  borderTopWidth: 1,
  borderColor: '#eee',
},

  confirmBox: {
    position: "absolute",
    top: "40%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    zIndex:2,
    elevation:2
  },
  confirmTitle: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  confirmActions: { flexDirection: "row", justifyContent: "space-between" },
  cancelBtn: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  confirmBtn: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    alignItems: "center",
    backgroundColor: "#d9534f",
    borderRadius: 4,
  },
  confirmBtnText: { color: "#fff" },

  modalcontact: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
    zIndex: 20,
  },
  modalTitle: { fontSize: 18, marginBottom: 16, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  cancel: { backgroundColor: "#eee" },
  confirm: { backgroundColor: "#d9534f" },
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
  searchcontact: {
    position: "absolute",
    top: 28, // adjust as needed
    right: 0, // if you want full screen contact, or just position relative to your header
    backgroundColor: "white", // optional semi-transparent background
    // additional styling (padding, etc.) if needed
    borderRadius: 43,
    width: 340,
    zIndex: 10,
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
    paddingHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
    // width: 44,
    borderWidth: 1,
    borderColor: "#445399",
    padding: 4,
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
    gap: 10,
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
    backgroundColor: "#EB5B00",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
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
  contact: {
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
