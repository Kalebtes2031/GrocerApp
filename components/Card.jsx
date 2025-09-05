import React, { useState, useEffect } from "react";
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
const CARD_WIDTH = width * 0.4;

const Card = ({
  product,
  onAdded,
  onRemoveWishlist,
  inWishlistView = false,
}) => {
  const { t, i18n } = useTranslation("card");
  const { cart, addItemToCart, isInCart, removeItemFromCart } = useCart();
  const { addToWatchlist, removeFromWatchlist, isFavorite } = useWatchlist();
  // const [isFavorited, setIsFavorited] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  // const [added, setAdded] = useState(false);
  // protect against items being undefined, and variation missing:
  const added = isInCart(product.variation.id);
  const inCart = isInCart(product.variation.id);

  const [optimisticInCart, setOptimisticInCart] = useState(inCart);
  useEffect(() => {
    setOptimisticInCart(inCart); // keep it in sync if cart changes elsewhere
  }, [inCart]);

  const isFavorited = isFavorite(product.variation.id);

  const toggleFavorite = () => {
    if (isFavorited) {
      removeFromWatchlist(product.variation.id);
      Toast.show({
        type: "info",
        text1: t("removed"),
        visibilityTime: 2000,
      });
    } else {
      addToWatchlist(product);
      Toast.show({
        type: "success",
        text1: t("added"),
        visibilityTime: 2000,
      });
    }
  };

  const handlePress = () => {
    router.push(
      `/carddetail?product=${encodeURIComponent(JSON.stringify(product))}`
    );
  };

  const handleRemoveWishlist = (e) => {
    e.stopPropagation();
    if (onRemoveWishlist) {
      onRemoveWishlist(product.variation.id);
      Toast.show({
        type: "info",
        text1: t("removed_from_wishlist"),
        visibilityTime: 2000,
      });
    }
  };

  const handleAddCartClick = async () => {
    if (product.variation.in_stock === false) {
      Toast.show({
        type: "error",
        text1: t("out_stock"),
        visibilityTime: 2000,
      });
      return;
    }
    try {
      console.log("product.variations.id", product);

      await addItemToCart(product.variation.id, 1);

      Toast.show({
        type: "success",
        text1: t("product"),
        visibilityTime: 2000,
      });
      // setAdded(true);

      // 3) extra hook (e.g. remove from wishlist)
      if (onAdded) onAdded(product.variation.id);
    } catch (error) {
      console.error("Error when add item to cart", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.cardContainer,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
      ]}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
        {/* <View style={styles.imageOverlay} /> */}

        {/* Top Icons */}
        <View style={styles.topIconsContainer}>
          {(!inWishlistView || !added) && (
            <TouchableOpacity
              onPress={() => {
                // immediately update the icon
                setOptimisticInCart(!optimisticInCart);

                if (optimisticInCart) {
                  // was in cart, now optimistically remove
                  removeItemFromCart(product.variation.id).catch(() => {
                    // revert on error
                    setOptimisticInCart(true);
                  });
                } else {
                  // was not in cart, now optimistically add
                  addItemToCart(product.variation.id, 1).catch(() => {
                    // revert on error
                    setOptimisticInCart(false);
                  });
                }
              }}
              style={[styles.iconButton2, { backgroundColor: "#445399" }]}
            >
              <AntDesign
                name={optimisticInCart ? "checkcircleo" : "shoppingcart"}
                size={24}
                color={optimisticInCart ? "rgba(249, 244, 247, 0.8)" : "#fff"}
              />
            </TouchableOpacity>
          )}
          {/* --- REMOVE‐FROM‐WISHLIST ICON (only if prop exists) --- */}
          {/* {onRemoveWishlist && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleRemoveWishlist}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="clear"               
                size={24}
                color="#EB5B00"
              />
            </TouchableOpacity>
          )} */}
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
            {i18n.language === "en" ? product.item_name : product.item_name_amh}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.unitText}>
              {parseInt(product?.variation?.quantity)}{" "}
              {t(`${product?.variation?.unit}`)}
            </Text>
            <Text style={styles.priceText}>
              {i18n.language === "en" ? "Birr" : ""} {product.variation?.price}{" "}
              {i18n.language === "amh" ? "ብር" : ""}
            </Text>
          </View>
        </View>
      </View>
      {/* cartscreen back /shop */}
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
    borderWidth: 1,
    borderColor: "#445399",
    marginBottom: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#445399",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 170,
  },
  imageContainer: {
    height: 150,
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
  iconButton2: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    padding: 6,
    // elevation: 2,
    zIndex: 0,
    elevation: 0,
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
  cartButton2: {
    backgroundColor: "rgba(39, 54, 245, 0.59)",
  },
  infoOverlay: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(68, 83, 153, 0.95)", // 80% opacity
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
