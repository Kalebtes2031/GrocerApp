import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useCart } from "@/context/CartProvider";
import Toast from "react-native-toast-message";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useWatchlist } from "@/context/WatchlistProvider";

const { width } = Dimensions.get("window");

const ProductDetail = () => {
  const { t, i18n } = useTranslation("carddetail");
  // const { product } = route.params;
  const { product: productString } = useLocalSearchParams();
  const product = productString ? JSON.parse(productString) : null;
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);
  const colorScheme = useColorScheme();
  const { cart, addItemToCart } = useCart();
  const router = useRouter();
  // const [isFavorited, setIsFavorited] = useState(false);
  const { watchlist, addToWatchlist, removeFromWatchlist , isFavorite} = useWatchlist();


  useEffect(() => {
    console.log('try to work is hard:', watchlist)
    console.log('try to work is nothard:', product)
  },[])
  const isFavorited = isFavorite(product.variation.id);
const toggleFavorite = () => {
  if (isFavorited) {
    removeFromWatchlist(product.variation.id);
    Toast.show({
      type: "info",
      text1:t('removed'),
      visibilityTime: 2000,
    });
  } else {
    addToWatchlist(product);
    Toast.show({
      type: "success",
      text1: t('added'),
      visibilityTime: 2000,
    });
  }
};
  // Create array of all available images
  const images = [
    product.image,
    product.image_back,
    product.image_full,
    product.image_left,
    product.image_right,
  ];

  const handleAddToCart = () => {
    console.log("quantity", quantity);
    console.log("id", product.variation.id);
    addItemToCart(product.variation.id, quantity);

    Toast.show({
      type: "success",
      text1: "Product added to cart",
    });
    router.push('/(tabs)/cartscreen')
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('no')}</Text>
      </SafeAreaView>
    );
  }
  // useEffect(()=> {
  //   console.log("tg product", product)
  // },[])

  // console.log('ok now i wanna know if product is here: ', product)
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#000" : "#fff" },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <Header /> */}
        <View
          style={{
            height: 150,
            backgroundColor: "#fff",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "start",
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ 
              marginRight: 10, 
              paddingHorizontal: 2,
              width:30, 
              height:30,
              flexDirection:"row",
              justifyContent:"center",
              alignItems:"center",
              borderWidth:1,
              borderRadius:50,
              borderColor:"#445399",
              paddingVertical:2,
            
            }}
            className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
          >
            <Ionicons name="arrow-back" size={24} color="#445399" />
          </TouchableOpacity>
          <View 
          style={{
            flexDirection:"row",
            justifyContent:"space-between",
            alignItems:"center",
          }}
          // className="flex flex-row justify-between items-center"
          >
            <Text
              className="text-primary font-poppins-bold mt-6 mb-10"
              style={{ fontSize: 18, fontWeight: 700, color:"#445399", marginTop:10, marginBottom:12 }} 
            >
              {i18n.language === "en"?product.category?.name:product.category?.name_amh}
            </Text>
            {/* Price and Stock Status */}
            <View style={styles.priceContainer} className="mt-6">
              {/* <Text style={styles.priceText}>ETB {product.price}</Text> */}
              <View
                style={[
                  styles.stockStatus,
                  {
                    backgroundColor: product.variation?.in_stock
                      ? "#4CAF50"
                      : "#F44336",
                  },
                ]}
              >
                <Text style={styles.stockText}>
                  {product.variation?.in_stock
                    ? i18n.language === "en"? "In Stock" : "In Stock"
                    : i18n.language === "en"? "Out of Stock" : "Out of Stock"}
                </Text>
              </View>
            </View>
          </View>
          <Text
            className="text-primary font-poppins-bold"
            style={{ fontFamily:"Poppins-bold",color:"#445399",fontSize: 18, fontWeight: 700, textAlign: "center" }}
          >
            {i18n.language === "en"?product.item_name:product.item_name_amh}
          </Text>
        </View>
        {/* Main Product Image */}
        <View style={styles.mainImageContainer}>
          <Image
            source={{
              uri:
                selectedImage ||
                product.image ||
                "https://via.placeholder.com/300",
            }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          <Text
            // className="text-primary absolute left-10 bottom-1 font-poppins-bold mt-6 mb-10"
            style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color:"#445399",
              marginTop:10,
              marginBottom:12,
              position: "absolute",
              left: 10,
              bottom: 10,
              fontFamily:"Poppins-bold",
              fontWeight: 700,
            }}
          >
            {i18n.language === "en" ? t('br') : ""} {parseInt(product.variation?.price)} {i18n.language === "amh" ? t('br') : ""}
          </Text>
          <View
            style={styles.quantityContainer}
            // className="absolute right-10 bottom-6"
            
          >
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.quantityButton}
            >
              <MaterialIcons name="remove" size={24} color="#445399" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.quantityButton}
            >
              <MaterialIcons name="add" size={24} color="#445399" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Gallery */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(img)}
                style={[
                  styles.galleryImageContainer,
                  selectedImage === img && styles.selectedImageContainer,
                ]}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Container */}
        <View style={styles.detailsContainer}>
          {/* Category Badge */}
          {/* <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category?.name}</Text>
          </View> */}

          {/* Product Title */}
          {/* <Text
            style={[
              styles.title,
              { color: colorScheme === "dark" ? "#fff" : "#000" },
            ]}
          >
            {product.item_name}
          </Text> */}

          {/* Amharic Name */}
          {/* {product.item_name_amh && (
            <Text style={[styles.amharicText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              {product.item_name_amh}
            </Text>
          )} */}

          {/* Product Description Section */}
          {/* <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colorScheme === "dark" ? "#fff" : "#000" },
              ]}
            >
              {t('detail')}
            </Text>
            <Text
              style={[
                styles.description,
                { color: colorScheme === "dark" ? "#ccc" : "#666" },
              ]}
            >
              Oranges are rich in vitamin C, which is essential for the immune
              system and overall health. They also contain dietary fiber, which
              aids digestion, as well as other vitamins and minerals like
              vitamin A, potassium, and antioxidants.
            </Text>
          </View> */}

          {/* Size Chart (Add your actual size data) */}
          {/* <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Available Sizes
            </Text>
            <View style={styles.sizeContainer}>
              {['S', 'M', 'L', 'XL'].map((size) => (
                <TouchableOpacity key={size} style={styles.sizeButton}>
                  <Text style={styles.sizeText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View
        style={[
          styles.actionBar,
          { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
        ]}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name={isFavorited ? "favorite" : "favorite-border"}
            size={34}
            color="#445399"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartButton}
        >
          <Text style={styles.addToCartText}>{t('add')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for fixed action bar
  },
  mainImageContainer: {
    height: width * 0.8,
    backgroundColor: "#D6F3D5",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: 8,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "60%",
    borderRadius: 8,
    position: "absolute",
    top: 25,
  },
  galleryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  galleryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedImageContainer: {
    borderColor: "#445399",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  categoryBadge: {
    backgroundColor: "#445399",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  amharicText: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: "NotoSansEthiopic-Regular",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop:14
  },
  priceText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#445399",
  },
  stockStatus: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  stockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 90,
    paddingLeft:50,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sizeButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // actionBar: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   padding: 16,
  //   borderTopWidth: 1,
  //   borderTopColor: '#eee',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: -2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 5,
  // },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 2,
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#445399",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 12,
    width: 10,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProductDetail;
