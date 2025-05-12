import Card from "@/components/Card";
import Header from "@/components/Header";
import SearchComp from "@/components/SearchComp";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  fetchAnnouncements,
} from "@/hooks/useFetch";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useRouter } from "expo-router";
import { useCart } from "@/context/CartProvider";
import { Ionicons } from "@expo/vector-icons";
import { groupVariationsByProduct } from "@/utils/groupByProducts";
import LocationTracker from "@/LocationTracker";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

// Get device width for the scroll item (or use DEVICE_WIDTH for full-screen width)
const { width: DEVICE_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 255; // Adjust as needed

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
  // const [image, setImages] = useState([]);
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllAnnouncements = async () => {
    try {
      const result = await fetchAnnouncements();
      setAnnouncements(result);
      setLoading(false);
      console.log("all announcements", result);
    } catch (error) {
      console.error("Error fetching announcements", error);
      setLoading(false);
    }
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
      const variations = await fetchPopularProducts();

      // Turn each variation into a "product-with-variation" object
      const products = variations.map((v) => ({
        id: v.product.id,
        item_name: v.product.item_name,
        item_name_amh: v.product.item_name_amh,
        image: v.product.image,
        // if you need the other image_* fields (full, left, etc),
        // you’ll have to include them in your ProductVariantSerializer
        // and then spread them here:
        // image_full:     v.product.image_full,
        // image_left:     v.product.image_left,
        // …etc.

        category: v.product.category, // only if your serializer includes it

        variation: {
          id: v.id,
          quantity: v.quantity,
          unit: v.unit,
          price: v.price,
          in_stock: v.in_stock,
          stock_quantity: v.stock_quantity,
          popularity: v.popularity,
        },
      }));

      setVeryPopular(products);
      console.log("Popular Products w/ Variations:", products);
    } catch (error) {
      console.error("Error fetching popular items", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      newPopular();
      fetchNewCategories();
      fetchAllAnnouncements();
    }, [])
  );
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    fetchNewCategories();
    newPopular();
    fetchAllAnnouncements();
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
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

  // Auto-scroll every 4 seconds
  // useEffect(() => {
  //   if (images.length === 0) return;
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  //   }, 4000);
  //   return () => clearInterval(interval);
  // }, [images]);

  useEffect(() => {
    if (loading || announcements.length === 0) return;
    const extendedLength = announcements.length + 1; // Extended array length
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % extendedLength);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading, announcements]);

  useEffect(() => {
    if (scrollViewRef.current) {
      const extendedLength = announcements.length + 1;
      if (currentIndex === extendedLength - 1) {
        // Scroll to the duplicated item (last in extended array)
        scrollViewRef.current.scrollTo({
          x: currentIndex * ITEM_WIDTH,
          animated: true,
        });
        // Reset to start after the scroll animation
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, animated: false });
            setCurrentIndex(0);
          }
        }, 500); // Match animation duration (adjust if needed)
      } else {
        scrollViewRef.current.scrollTo({
          x: currentIndex * ITEM_WIDTH,
          animated: true,
        });
      }
    }
  }, [currentIndex, announcements.length]);

  // Create extended announcements array for rendering
  const extendedAnnouncements =
    announcements.length > 0 ? [...announcements, announcements[0]] : [];

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour < 6) {
      setGreeting(t("night")); // Midnight to 6 AM
    } else if (currentHour < 12) {
      setGreeting(t("morning")); // 6 AM to 12 PM
    } else if (currentHour < 15) {
      setGreeting(t("afternoon1")); // 12 PM to 19 PM
    }else if (currentHour < 18) {
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

  const SkeletonCard = () => (
    <View style={styles.card}>
      <View style={[styles.image, { backgroundColor: "#E5E7EB" }]} />
      <View
        style={[
          styles.textContainer,
          { backgroundColor: "#E5E7EB", height: 20, width: "60%" },
        ]}
      />
    </View>
  );
  const SkeletonCategoryCard = () => (
    <View style={styles.skeletonCategoryCard}>
      <View style={styles.skeletonCategoryImage} />
      <View style={styles.skeletonCategoryLine} />
      {/* <View style={styles.skeletonLineShort} /> */}
    </View>
  );
  const ProductCardSkeleton = () => (
    <View
      style={{
        width: "100%",
        height: 200, // Adjust based on actual Card height
        backgroundColor: "#E5E7EB", // Tailwind gray-200
        borderRadius: 12,
      }}
    />
  );
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
          marginLeft: 24,
          gap: 6,
          // marginTop: 6,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: "#445399",
            fontFamily: "Poppins-Medium",
          }}
          // className="text-lg  font-poppins-medium text-primary "
        >
          {greeting}
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "#445399",
            fontFamily: "Poppins-Medium",
            fontStyle: "italic",
            marginLeft: 4,
            marginBottom: 3,
          }}
          className="italic ml-2 text-primary"
        >
          {user?.first_name} {user?.last_name}
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
           
            <Image source={img.image} style={styles.image} />
           
            <View style={styles.overlay} />
           
            <View style={styles.textContainer}>
              <Text className="font-poppins-bold" style={styles.text}>
                {img.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView> */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingRight: 60 }}
      >
        {loading ? (
          [0, 1, 2].map((i) => <SkeletonCard key={i} />)
        ) : announcements.length === 0 ? (
          <Text style={{textAlign:"center"}} className="text-gray-500 text-center">
            {t('noannounce')}
          </Text>
        ) : (
          extendedAnnouncements.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.card}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <View style={styles.overlay} />
              <View style={styles.textContainer}>
                <Text className="font-poppins-bold" style={styles.text}>
                  {item.title}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* categories*/}
      <View  className="">
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 20,
          }}
          className="flex flex-row justify-between pr-12 items-center"
        >
          <Text
            style={{
              color: colorScheme === "dark" ? "white" : "#445399",
              padding: 16,
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "start",
            }}
          >
            {t("categories")}
          </Text>
          <TouchableOpacity
            onPress={() => {
              route.push("/(tabs)/category");
            }}
          >
            <Ionicons name="arrow-forward-sharp" size={32} color="#445399" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            // className="px-8"
            style={{ paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingRight: 40 }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={index}
                style={{
                  width: 96,
                  height: 96,
                  backgroundColor: "#E5E7EB", // Tailwind gray-200
                  borderRadius: 12,
                  marginRight: 16,
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-8"
            style={{ paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingRight: 1 }}
          >
            {category && category.length > 0 ? (
              category.map((product, index) => (
                <TouchableOpacity
                  key={product.id || index}
                  onPress={() =>
                    handlecategory(product.id, product.name, product.name_amh)
                  }
                  style={{ flexDirection: "column", marginHorizontal: 4 }}
                  // className="flex justify-center items-center mx-2"
                >
                  <View
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#445399",
                      marginTop: 4,
                      width: 100,
                    }}
                    className="text-sm font-medium mt-2 text-center"
                  >
                    {i18n.language === "en" ? product.name : product.name_amh}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              // Array.from({ length: 6 }).map((_, index) => (
              //     <View
              //       key={index}
              //       style={{
              //         width: 96,
              //         height: 96,
              //         backgroundColor: "#E5E7EB",
              //         borderRadius: 12,
              //         marginRight: 16,
              //       }}
              //     />
              //   ))
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#445399",
                  marginTop: 4,
                }}
                className="text-gray-500 text-center"
              >
                {t('nocategory')}
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Recommended Products */}
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 20,
          }}
          // className="flex flex-row justify-between pr-12 items-center"
        >
          <Text
            style={{
              color: colorScheme === "dark" ? "white" : "#445399",
              paddingHorizontal: 16,
              paddingTop:8,
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
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.cardWrapper}>
                <ProductCardSkeleton />
              </View>
            ))
          ) : veryPopular.length > 0 ? (
            veryPopular.map((product, index) => (
              <View
                key={product.variation.id || index}
                style={styles.cardWrapper}
              >
                <Card product={product} />
              </View>
            ))
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text className="text-gray-500 text-center">
                {t('norecommended')}
              </Text>
              <View className="">
                <Image
                  source={require("@/assets/images/empty2.png")}
                  style={styles.exploreImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginHorizontal: 18,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              route.push("/(tabs)/shop");
            }}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#445399",
              padding: 12,
              marginBottom: 22,
              borderRadius: 42,
              width: "100%",
            }}
          >
            <Text
              style={{ color: "white", fontSize: 18 }}
              className="font-poppins-medium"
            >
              {" "}
              {t('more')}
            </Text>
          </TouchableOpacity>
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
  cardCategoryContainer: {
    width: 96,
    marginBottom: 12,
    marginRight: 12,
  },
  skeletonCategoryCard: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    margin: 8,
    // marginTop:55,
    width: "100%",
  },

  skeletonCategoryImage: {
    height: 100,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },

  skeletonCategoryLine: {
    height: 12,
    backgroundColor: "#ccc",
    marginBottom: 6,
    borderRadius: 6,
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
    // marginBottom: 1,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap", // Allows wrapping to the next row
    justifyContent: "space-between", // Adds spacing between cards
  },
  cardWrapper: {
    // backgroundColor: "#fff",
    width: "48%",
    marginBottom: 12, // Adds spacing between rows
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
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  card: {
    width: ITEM_WIDTH,
    height: 130,
    borderRadius: 20,
    overflow: "hidden", // Ensures the children are clipped to the borderRadius
    marginRight: 16, // Gap between cards
    position: "relative",
    marginTop:6
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
    // height: 300,

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
