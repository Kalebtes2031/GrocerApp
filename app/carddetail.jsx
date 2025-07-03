import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useCart } from "@/context/CartProvider";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useWatchlist } from "@/context/WatchlistProvider";
import { fetchRelatedProducts } from "@/hooks/useFetch";
import Card from "@/components/Card";

const { width } = Dimensions.get("window");

const ProductDetail = () => {
  const { t, i18n } = useTranslation("carddetail");
  const { product: productString } = useLocalSearchParams();
  const product = productString ? JSON.parse(productString) : null;
  const productId = product?.id;
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);
  const colorScheme = useColorScheme();
  const { addItemToCart } = useCart();
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isFavorite } = useWatchlist();

  const [relatedProducts, setRelatedProducts] = useState([]);
const [loadingRelated, setLoadingRelated] = useState(false);
const [relatedError, setRelatedError] = useState(null);

useEffect(() => {
  if (!productId) return;
  let mounted = true;
  setLoadingRelated(true);
  fetchRelatedProducts(productId)
    .then(data => mounted && setRelatedProducts(data))
    .catch(err => mounted && setRelatedError(err))
    .finally(() => mounted && setLoadingRelated(false));
  return () => { mounted = false; };
}, [productId]);

const flattenedRelated = relatedProducts.flatMap(prod =>
  prod.variations?.filter(v => v.in_stock).map(v => ({ ...prod, variation: v })) || []
);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t("no")}</Text>
      </SafeAreaView>
    );
  }

  const isFavorited = isFavorite(product.variation.id);
  const toggleFavorite = () => {
    if (isFavorited) {
      removeFromWatchlist(product.variation.id);
      Toast.show({ type: "error", text1: t("removed"), visibilityTime: 2000 });
    } else {
      addToWatchlist(product);
      Toast.show({ type: "success", text1: t("added"), visibilityTime: 2000 });
    }
  };

  const images = [
    product.image,
    product.image_back,
    product.image_full,
    product.image_left,
    product.image_right,
  ].filter(Boolean);

  const handleAddToCart = () => {
    if (!product.variation.in_stock) {
      Toast.show({ type: "error", text1: t("out_stock"), visibilityTime: 2000 });
      return;
    }
    addItemToCart(product.variation.id, quantity);
    Toast.show({ type: "success", text1: t("added1") });
    router.push("/(tabs)/cartscreen");
  };
  // Header + main content + related products
  return (
    <View style={[styles.container, { backgroundColor: colorScheme === "dark" ? "#000" : "#fff" }]}>      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Existing Header */}
        <View style={{ height: 130, backgroundColor: "#fff", flexDirection: "column", justifyContent: "center", paddingHorizontal: 2 }}>          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10, paddingHorizontal: 2, width: 30, height: 30, borderWidth: 1, borderRadius: 50, borderColor: "#445399", paddingVertical: 2, justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="arrow-back" size={24} color="#445399" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 700, color: "#445399", marginTop: 10, marginBottom: 12 }}>
              {i18n.language === "en" ? product.category.name : product.category.name_amh}
            </Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: "Poppins-bold", color: "#445399", fontSize: 18, fontWeight: 700 }}>
              {i18n.language === "en" ? product.item_name : product.item_name_amh}
            </Text>
            <View style={styles.priceContainer}>
              <View style={[styles.stockStatus, { backgroundColor: product.variation.in_stock ? "#4CAF50" : "#F44336" }]}>
                <Text style={styles.stockText}>
                  {product.variation.in_stock ? (i18n.language === "en" ? "In Stock" : "ለሽያጭ ቀርቧል") : (i18n.language === "en" ? "Out of Stock" : "ለሽያጭ አልቅረበም")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Product Image */}
        <View style={styles.mainImageContainer}>
          <Image source={{ uri: selectedImage || product.image }} style={styles.mainImage} resizeMode="contain" />
          <View style={styles.infoOverlay}>
            <Text style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "Poppins-bold" }}>
              {i18n.language === "en" ? t("br") : ""} {parseInt(product.variation.price)} {i18n.language === "amh" ? t("br") : ""}
            </Text>
            <View style={styles.quantityContainer}>
              <View style={{ borderWidth: 1, borderColor: "#445399", borderRadius: 44, margin: 6 }}>
                <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q-1))} style={styles.quantityButton}>
                  <MaterialIcons name="remove" size={24} color="#445399" />
                </TouchableOpacity>
              </View>
              <Text style={styles.quantityText}>{quantity}</Text>
              <View style={{ borderWidth: 1, borderColor: "#445399", borderRadius: 44, margin: 6 }}>
                <TouchableOpacity onPress={() => setQuantity(q => q+1)} style={styles.quantityButton}>
                  <MaterialIcons name="add" size={24} color="#445399" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Image Gallery */}
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainer}>
            {images.map((img, idx) => (
              <TouchableOpacity key={idx} onPress={() => setSelectedImage(img)} style={[styles.galleryImageContainer, selectedImage === img && styles.selectedImageContainer]}>
                <Image source={{ uri: img }} style={styles.galleryImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

       {/* Related Section */}
        {/* {loadingRelated && <Text style={styles.statusText}>{t("loading_related")}</Text>}
        {relatedError && <Text style={[styles.statusText, { color: 'red' }]}>{`Error: ${relatedError.message}`}</Text>}
        {!loadingRelated && !relatedError && flattenedRelated.length > 0 && (
          <Text style={styles.relatedTitle}>{t("related")}</Text>
        )}
        <FlatList
          data={flattenedRelated}
          keyExtractor={(item) => item.variation.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.relatedWrapper}
          renderItem={({ item }) => <Card product={item} />}
          scrollEnabled={false}
        /> */}
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" }]}>        
        <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name={isFavorited ? "favorite" : "favorite-border"} size={34} color="#445399" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>{t("add")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 18,
    backgroundColor: "rgba(68, 83, 153, 0.95)",
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 6,
  },
  quantityContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 2,
    zIndex: 10,
    elevation: 5,
  },
  quantityButton: {},
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
    marginHorizontal: 6,
  },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 13, paddingBottom: 80 },
  mainImageContainer: {
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 44,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#445399",
    position: "relative",
  },
  mainImage: { width: "80%", height: "60%", borderRadius: 8, position: "absolute", top: 25 },
  galleryContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  galleryImageContainer: { width: 80, height: 80, borderRadius: 8, marginRight: 12, borderWidth: 2, borderColor: "transparent", overflow: "hidden" },
  selectedImageContainer: { borderColor: "#445399" },
  galleryImage: { width: "100%", height: "100%", borderRadius: 8 },
  priceContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 14 },
  stockStatus: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  stockText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 90,
    paddingLeft: 50,
  },
  iconButton: { padding: 8 },
  addToCartButton: { flex: 1, backgroundColor: "#445399", borderRadius: 8, paddingVertical: 16, alignItems: "center", marginLeft: 12 },
  addToCartText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  statusText: { margin: 16, color: '#445399' },
  relatedTitle: { fontSize: 18, fontWeight: '700', marginLeft: 16, marginVertical: 12, color: '#445399' },
  relatedWrapper: { justifyContent: 'space-between', paddingHorizontal: 13, marginBottom: 16 },
});

export default ProductDetail;
