import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { fetchSameCategoryProducts } from "@/hooks/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const CategoryDetail = () => {
  const { t, i18n } = useTranslation("categorydetail");
  const { categoryId, name, name_amh } = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    loadProducts();
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
    }, 2000);
  }, []);
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchSameCategoryProducts(Number(categoryId));
      setProducts(data);
      console.log("Category name:", name);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadProducts();
  }, [categoryId]);

  // Flatten the array to have one item per variation
  const flattenedProducts = products.flatMap((product) =>
    product.variations.map((variation) => ({
      ...product,
      variation, // attach specific variation details
    }))
  );

  const handlePress = (item) => {
    router.push(
      `/carddetail?product=${encodeURIComponent(JSON.stringify(item))}`
    );
  };
  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineShort} />
    </View>
  );
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { marginLeft: index % 2 === 0 ? 0 : 32 }, // Adjust horizontal margin
        { marginTop: index % 2 === 0 ? 20 : 55 }, // Alternating top margin for a zig-zag effect
      ]}
      onPress={() => handlePress(item)}
    >
      {/* Product Name */}
      <Text style={styles.productName}>
        {i18n.language === "en" ? item.item_name : item.item_name_amh}
      </Text>

      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>

      {/* Price Circle using specific variation info */}
      <View style={styles.priceCircle}>
        <Text style={styles.priceText}>
          {t("br")} {parseInt(item.variation.price)}
        </Text>
        <Text style={styles.unitText}>
          {parseInt(item.variation.quantity)} /{item.variation.unit}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/(tabs)/home");
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#445399" />
        </TouchableOpacity>

        <Text style={styles.categoryTitle}>
          {i18n.language === "en" ? name : name_amh} {t("category")}
        </Text>
      </View>

      {/* Product Grid */}
      {loading ? (
        <FlatList
          data={Array.from({ length: 6 })} // show 6 skeleton cards
          renderItem={() => (
            <View style={styles.card}>
              <SkeletonCard />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={flattenedProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.variation.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("noproduct")}</Text>
            </View>
          }
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skeletonCard: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    // borderBottomRadius:32,
    padding: 10,
    // margin: 8,
    marginTop: 55,
    width: "100%",
  },

  skeletonImage: {
    height: 100,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },

  // skeletonLine: {
  //   height: 12,
  //   backgroundColor: "#ccc",
  //   marginBottom: 6,
  //   borderRadius: 6,
  // },

  skeletonLineShort: {
    height:12,
    backgroundColor: "#ccc",
    width: "60%",
    borderRadius: 6,
  },
  header: {
    height: height * 0.27,
    backgroundColor: "#445399",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 40,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  categoryTitle: {
    position: "absolute",
    top: 100,
    left: 120,
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    position: "absolute",
    top: 90,
    right: 20,
    width: width * 0.5,
    backgroundColor: "#fff",
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#445399",
  },
  searchIcon: {
    marginLeft: 10,
  },
  card: {
    width: width * 0.39, // Adjusted width for better grid alignment
    backgroundColor: "#D6F3D5",
    borderRadius: 15,
    marginHorizontal: 5,
    padding: 15,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    height: 230, // Set a fixed height to ensure uniform card dimensions
    zIndex: 50,
  },

  imageContainer: {
    backgroundColor: "#D6F3D5",
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  productName: {
    color: "#445399",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  priceCircle: {
    position: "absolute",
    right: -28,
    top: 40,
    backgroundColor: "#4CAF50",
    width: 62,
    height: 62,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  priceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  unitText: {
    color: "#fff",
    fontSize: 10,
  },
  listContent: {
    // paddingTop: height * 0.25 + 20,
    paddingBottom: 20,
    marginLeft: 10,
    paddingHorizontal: 5,
    // backgroundColor: "red",
    marginTop: -0,
    // zIndex: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.3,
  },
  emptyText: {
    color: "#445399",
    fontSize: 18,
  },
});

export default CategoryDetail;
