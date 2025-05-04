import Card from "@/components/Card";
import Header from "@/components/Header";
import SearchComp from "@/components/SearchComp";
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from "react-native";

import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useNavigation } from "@react-navigation/native";
import {
  fetchCategory,
  fetchNewImages,
  fetchPopularProducts,
  fetchSameCategoryProducts,
  USER_PROFILE,
} from "@/hooks/useFetch";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useRouter } from "expo-router";
import { useCart } from "@/context/CartProvider";
import { Ionicons } from "@expo/vector-icons";

import LocationTracker from "@/LocationTracker";
import { useTranslation } from "react-i18next";

// Get device width for the scroll item (or use DEVICE_WIDTH for full-screen width)
const { width: DEVICE_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 335; // Adjust as needed

export default function HomeScreen() {
  const { t, i18n } = useTranslation("home");
  const { setCart, addItemToCart } = useCart();
  const { isLogged, user } = useGlobalContext();
  const route = useRouter();
  const colorScheme = useColorScheme();
  const [veryPopular, setVeryPopular] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [category, setCategory] = useState([]);
  const [product, setProduct] = useState(null);

  const handleCartClick = (id) => {
    // navigate(`/shop/${id}`); // Redirect to /shop/:id
    console.log("Cart clicked!", id);
  };

  const fetchNewCategories = async () => {
    try {
      const response = await fetchCategory();
      console.log("Categories: ", response);
      setCategory(response); // Set the fetched categories in state
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const newestImages = async () => {
    try {
      const data = await fetchNewImages();
      const firstFourNewestImages = data.slice(0, 4);
      // console.log('newest images: ', firstFourNewestImages)
      setNewImages(firstFourNewestImages);
    } catch (error) {
      console.error("Error fetching new images", error);
    }
  };

  const newPopular = async () => {
    try {
      const data = await fetchPopularProducts();
      // console.log("all data: ", data)
      const firstFourPopularImages = data.slice(0, 4);
      setVeryPopular(firstFourPopularImages);
      console.log("first four:", firstFourPopularImages);
    } catch (error) {
      console.error("Error fetching new popular images", error);
    }
  };

  useEffect(() => {
    newestImages();
    newPopular();
    fetchNewCategories();
    console.log("am i logged in: ", isLogged);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  // Hard-coded array of images with text captions (using local images)
  const images = [
    {
      image: require("@/assets/images/signup.png"),
      text: "Recomended Items Today",
    },
    {
      image: require("@/assets/images/signup.png"),
      text: "Recomended Items Today",
    },
    {
      image: require("@/assets/images/signup.png"),
      text: "Recomended Items Today",
    },
  ];

  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  // Scroll to the current index when it changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentIndex * ITEM_WIDTH,
        animated: true,
      });
    }
  }, [currentIndex]);
  let most = "Most Popular";
  let newest = "Newest Products";

  // // Redirect if user is not authenticated
  // useEffect(() => {
  //   if (!user) {
  //     route.push('/(auth)/sign-in');
  //   }
  // }, [user, route]);

  // // If there's no user, don't render the rest of the UI
  // if (!user) {
  //   return null;
  // }
  // useEffect(() => {
  //   const currentHour = new Date().getHours();

  //   if (currentHour < 12) {
  //     setGreeting("Good morning");
  //   } else if (currentHour < 18) {
  //     setGreeting("Good afternoon");
  //   } else {
  //     setGreeting("Good evening");
  //   }
  // }, []);
  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour < 6) {
      setGreeting(t("night")); // Midnight to 6 AM
    } else if (currentHour < 12) {
      setGreeting(t("morning")); // 6 AM to 12 PM
    } else if (currentHour < 18) {
      setGreeting(t("afternoon")); // 12 PM to 6 PM
    } else {
      setGreeting(t("evening")); // 6 PM to Midnight
    }
  }, [i18n.language]);

  const handlecategory = async (categoryId, name, name_amh) => {
    route.push(
      `/(tabs)/categorydetail?categoryId=${categoryId}&name=${encodeURIComponent(
        name
      )}&name_amh=${encodeURIComponent(name_amh)}`
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}
    >
      <Header />
      {/* greeting */}
      <View
        style={{
          diplay: "flex",
          flexDirection: "row",
          justifyContent: "start",
          alignItems: "center",
          marginLeft: 18,
          gap: 6,
        }}
      >
        <Text className="text-lg  font-poppins-medium text-primary ">
          {greeting}
        </Text>
        <Text className="italic ml-2 text-primary">
          gash {user?.first_name} {user?.last_name}
        </Text>
      </View>

      {/* Horizontal Image Carousel */}
      {/* <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingRight: 60 }}
      >
        {images.map((img, index) => (
          <View key={index} style={styles.card}>
            {/* Background image */}
      {/* <Image source={img.image} style={styles.image} /> */}
      {/* Semi-transparent overlay */}
      {/* <View style={styles.overlay} /> */}
      {/* Text overlay */}
      {/* <View style={styles.textContainer}> 
              <Text className="font-poppins-bold" style={styles.text}>
                {img.text}
              </Text>
            </View>
          </View>
        ))} */}
      {/* </ScrollView> */}

      {/* categories*/}
      <View className="pb-12">
        <View className="flex flex-row justify-between pr-12 items-center">
          <Text
            style={{
              color: colorScheme === "dark" ? "white" : "#445399",
              padding: 16,
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "start",
            }}
          >
            Orders
          </Text>
          {/* <TouchableOpacity
            onPress={() => {
              route.push("/(tabs)/category");
            }}
          >
            <Ionicons name="arrow-forward-sharp" size={32} color="#445399" />
          </TouchableOpacity> */}
        </View>
        <View 
          style={{
            flexDirection:"row",
            padding:22,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#445399",
              width: 200,
              height: 200,
              borderRadius: 22,
            }}
          >
            <Text style={{ color: "white", fontSize: 22 }}> 10</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {" "}
              Today's Orders
            </Text>
          </View>
        </View>
      </View>

      {/* Recommended Products */}
      <View>
        <View className="flex flex-row justify-between pr-12 items-center">
          <Text
            style={{
              color: colorScheme === "dark" ? "white" : "#445399",
              padding: 16,
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "start",
            }}
          >
            {t("recommended")}
          </Text>
          <TouchableOpacity
            onPress={() => {
              route.push("/(tabs)/shop");
            }}
          >
            <Ionicons name="arrow-forward-sharp" size={32} color="#445399" />
          </TouchableOpacity>
        </View>
        <View style={styles.popularContainer}>
          {veryPopular.length > 0 ? (
            veryPopular.map((product, index) => (
              <View key={product.id || index} style={styles.cardWrapper}>
                <Card product={product} />
              </View>
            ))
          ) : (
            <Text style={styles.loadingText}>{t("loading")}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imageContainer: {
    width: 96, // or 'w-24' converted to pixels, e.g., 96px
    height: 96, // same as above
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    borderColor: "rgba(0,0,0,0.2)", // slight border on left/right
    borderRadius: 24,
    backgroundColor: "#fff", // important for shadows
    // Shadow for iOS:
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // pushes shadow downward
    shadowOpacity: 0.3,
    shadowRadius: 1, // keep radius small so the top isn't blurred
    // For Android:
    elevation: 4, // for Android shadow
    // padding:2,
  },
  image1: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  popularContainer: {
    marginBottom: 36,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap", // Allows wrapping to the next row
    justifyContent: "space-between", // Adds spacing between cards
  },
  cardWrapper: {
    // backgroundColor: "#fff",
    width: "48%",
    marginBottom: 16, // Adds spacing between rows
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  headerContainer: {
    // Space between Header and SearchComp
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 12,
  },
  scrollView: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  card: {
    width: ITEM_WIDTH,
    height: 160,
    borderRadius: 20,
    overflow: "hidden", // Ensures the children are clipped to the borderRadius
    marginRight: 16, // Gap between cards
    position: "relative",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(101,100,114,0.2)",
  },
  textContainer: {
    position: "absolute",
    bottom: 10,
    padding: 16,
    width: 180,
    // backgroundColor: 'white'
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    letterSpacing: 0.5,
    lineHeight: 22,
    fontWeight: "700",
  },
  section: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBackground: {
    resizeMode: "cover",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  },
  contentContainer: {
    alignItems: "center",
    zIndex: 10,
  },
  exploreImage: {
    width: 200,
    height: 300,

    // borderWidth: 1,
    // borderColor: "#7E0201",
  },
  heading: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "italic",
    marginVertical: 10,
    width: 200,
  },
  heading1: {
    color: "#fff",
    textAlign: "start",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "italic",
    marginVertical: 10,
    width: 200,
  },
  heading2: {
    color: "#EFE1D1",
    textAlign: "start",
    fontSize: 8,
    fontWeight: "normal",
    marginBottom: 10,
    width: 200,
  },
  button: {
    width: 90,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7E0201",
    borderRadius: 28,
    marginRight: 106,
  },
  buttonText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "normal",
    textTransform: "uppercase",
  },
  paginationContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#97BD3D",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
});
