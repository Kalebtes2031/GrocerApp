import React, { useState, useTransition } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCart } from "@/context/CartProvider";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useWatchlist } from "@/context/WatchlistProvider";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45;

const Card = ({ product }) => {
  const { t, i18n } = useTranslation('card');
  const { addItemToCart } = useCart();
  const { addToWatchlist, removeFromWatchlist, isFavorite } = useWatchlist();
  // const [isFavorited, setIsFavorited] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

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




  const handlePress = () => {
    router.push(`/carddetail?product=${encodeURIComponent(JSON.stringify(product))}`);
  };

  const handleAddCartClick = async() => {
    try {
      console.log('product.variations.id', product)
      await addItemToCart(product.variation.id, 1);
      Toast.show({
        type: "success",
        text1: t('product'),
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error when add item to cart", error);
    }


  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[styles.cardContainer, { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" }]}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        
        {/* Top Icons */}
        <View style={styles.topIconsContainer}>
          <TouchableOpacity 
            style={[styles.iconButton, styles.cartButton]}
            onPress={handleAddCartClick}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AntDesign name="shoppingcart" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={isFavorited ? "favorite" : "favorite-border"}
              size={24}
              color="#445399"
            />
          </TouchableOpacity>
        </View>

        {/* Product Info Overlay */}
        <View style={styles.infoOverlay}>
          <Text style={styles.productName} numberOfLines={2}>
            {i18n.language === "en"?product.item_name: product.item_name_amh}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.unitText}>
              {parseInt(product?.variation?.quantity)}{" "}
              {product?.variation?.unit}
            </Text>
            <Text style={styles.priceText}>
              {i18n.language === "en"? "Birr":""} {product.variation?.price} {i18n.language === "amh"? "ብር":""} 
            </Text>
          </View>
        </View>
      </View>

      {/* Add to Cart Footer */}
      {/* <TouchableOpacity 
        style={styles.addToCartButton}
        onPress={handleAddCartClick}
      >
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginBottom: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 250,
  },
  imageContainer: {
    height: 280,
    justifyContent: "space-between",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  cartButton: {
    backgroundColor: "#445399",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  productName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 1,
    fontFamily: "Poppins-SemiBold",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 2,
  },
  unitText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    opacity: 0.9,
    fontWeight: "700",
  },
  priceText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Poppins-Bold",
  },
  addToCartButton: {
    backgroundColor: "#7E0201",
    paddingVertical: 12,
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
});

export default Card;