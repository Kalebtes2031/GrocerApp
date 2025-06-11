import React, { useEffect, useState, useMemo  } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions, 
  Platform,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCart } from "@/context/CartProvider";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useWatchlist } from "@/context/WatchlistProvider";
import { useTranslation } from "react-i18next";

 const { width, height } = Dimensions.get("window");
  const scale = (size) => (width / 375) * size; 

const CartScreen = () => {
  const { t, i18n } = useTranslation("cartscreen");
  const { watchlist } = useWatchlist();
  const {
    cart,
    setCart,
    itemOrder,
    loadCartData,
    updateItemQuantity,
    removeItemFromCart,
  } = useCart();
  const [localLoading, setLocalLoading] = useState(null);
  const router = useRouter();
  const [isCartLoading, setIsCartLoading] = useState(true);
  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;
  const [globalLoading, setGlobalLoading] = useState(false);
 
  const orderedItems = useMemo(() => {
  const idMap = new Map(items.map((item) => [item.variations.id, item]));
  return itemOrder.map((id) => idMap.get(id)).filter(Boolean);
}, [items, itemOrder]);

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity <= 0) return;
    // 1) keep a copy
    const prevCart = cart;

    // 2) optimistically patch:
    const patchedItems = cart.items.map((it) => {
      if (it.variations.id === itemId) {
        const unitPrice = parseFloat(it.variations.price) || 0;
        return {
          ...it,
          quantity: newQuantity,
          total_price: unitPrice * newQuantity,
        };
      }
      return it;
    });
    const patchedTotal = patchedItems.reduce(
      (sum, it) => sum + it.total_price,
      0
    );
    setCart({ ...cart, items: patchedItems, total: patchedTotal });

    try {
      setLocalLoading(itemId);
      await updateItemQuantity(itemId, newQuantity);
      Toast.show({ type: "success", text1: t("cartupdated") });
    } catch (error) {
      // 4) rollback if the API call fails
      setCart(prevCart);
      Toast.show({ type: "error", text1: "Update failed" });
    } finally {
      setLocalLoading(null);
    }
  };

  const handleRemoveCartItems = async (id) => {
    try {
      // setLocalLoading(id);
      await removeItemFromCart(id);
      await loadCartData();
      Toast.show({
        type: "success",
        text1: t("itemremoved"),
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Remove failed",
        text2: "Please try again",
      });
    }
  };
  const handlePress = (product) => {
    router.push(
      `/carddetail?product=${encodeURIComponent(JSON.stringify(product))}`
    );
  };
  useEffect(() => {
    const init = async () => {
      await loadCartData();
      setIsCartLoading(false);
    };
    init();
  }, []);

  if (isCartLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {cart.total === 0 ? (
        <View>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginHorizontal: 10,
                paddingHorizontal: 2,
                borderWidth: 1,
                borderRadius: 52,
                borderColor: "#445399",
                paddingVertical: 2,
              }}
              className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
            >
              <Ionicons name="arrow-back" size={24} color="#445399" />
            </TouchableOpacity>
            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/watchlistscreen")}
              >
                <MaterialIcons
                  name="favorite-border"
                  size={28}
                  color="#445399"
                />
              </TouchableOpacity>
              <View style={styles.badge}>
                {/* <Text style={styles.badgeText}>0</Text> */}
                <Text style={styles.badgeText}>{watchlist.length}</Text>
              </View>
            </View>
          </View>
          <Text
            // className="font-poppins-bold text-center text-primary mb-4"
            style={styles.headerTitle}
          >
            {t("shopping")}
          </Text>
          <View
            style={{
              flexDirection: "column",
              gap: 12,
              justifyContent: "center",
              alignItems: "center",
              padding: 23,
              backgroundColor: "rgba(150, 166, 234, 0.4)",
              margin: 42,
              borderRadius: 19,
            }}
          >
            <View
              style={{
                width: 240,
                height: 240,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("@/assets/images/emptycart.png")}
                resizeMode="contain"
              />
            </View>
            <Text
              className="text-primary font-poppins-bold"
              style={{
                fontSize: 16,
                fontWeight: 700,
                textAlign: "center",
                padding: 13,
                marginTop: 15,
              }}
            >
              {t("empty")}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* <Header /> */}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/shop')}
                style={{
                  marginHorizontal: 10,
                  paddingHorizontal: 2,
                  borderWidth: 1,
                  borderRadius: 52,
                  borderColor: "#445399",
                  paddingVertical: 2,
                }}
                className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
              >
                <Ionicons name="arrow-back" size={24} color="#445399" />
              </TouchableOpacity>
              <View style={styles.iconWrapper}>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/watchlistscreen")}
                >
                  <MaterialIcons
                    name="favorite-border"
                    size={28}
                    color="#445399"
                  />
                </TouchableOpacity>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{watchlist.length}</Text>
                </View>
              </View>
            </View>
            <Text
              className="font-poppins-bold text-center text-primary mb-4"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#445399",
                textAlign: "center",
                // fontFamily: "Poppins-Bold",
                postion: "absolute",
                top: -13,
              }}
            >
              {t("shopping")}
            </Text>

            <View style={styles.scrollContainers}>
              {orderedItems.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <TouchableOpacity
                  // onPress={() => handlePress(item)}
                  >
                    <Image
                      source={{ uri: item?.image }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  <View style={styles.detailsContainer}>
                    <View
                      // className="flex"
                      style={{
                        // display: "flex",
                        // flexDirection: "row",
                        // alignItems: "center",
                        // gap: 5,
                        // backgroundColor:"red",
                        width: 120,
                      }}
                    >
                      <Text
                        includeFontPadding={false}
                        style={styles.productName}
                      >
                        {i18n.language === "en"
                          ? item?.item_name
                          : item?.item_name_amh}
                        {"  "}
                        {parseInt(item?.variations?.quantity)}
                        {t(`${item?.variations?.unit}`)}
                      </Text>
                      <Text
                        includeFontPadding={false}
                        style={styles.productName}
                      ></Text>
                    </View>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          handleQuantityUpdate(
                            item.variations.id,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          localLoading === item.variations.id ||
                          item.quantity === 1
                        }
                      >
                        {localLoading === item.variations.id ? (
                          <ActivityIndicator size="small" color="#000" />
                        ) : (
                          <MaterialIcons
                            name="remove-circle-outline"
                            size={28}
                            color={item.quantity === 1 ? "#ccc" : "#445399"}
                          />
                        )}
                      </TouchableOpacity>

                      <Text style={styles.quantity}>{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() =>
                          handleQuantityUpdate(
                            item.variations.id,
                            item.quantity + 1
                          )
                        }
                        disabled={localLoading === item.variations.id}
                      >
                        {localLoading === item.variations.id ? (
                          <ActivityIndicator size="small" color="#000" />
                        ) : (
                          <MaterialIcons
                            name="add-circle-outline"
                            size={28}
                            color="#445399"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    {/* price */}
                    <View style={{ marginTop: 10, marginLeft: 8 }}>
                      <Text style={styles.price}>
                        {item?.quantity} x
                        {i18n.language === "en" ? t("br") : ""}
                        {parseFloat(item.variations?.price || "0").toFixed(
                          2
                        )}{" "}
                        {i18n.language === "amh" ? t("br") : ""}
                      </Text>
                      <Text style={styles.itemTotal}>
                        = {i18n.language === "en" ? t("br") : ""}
                        {(item.total_price || 0).toFixed(2)}{" "}
                        {i18n.language === "amh" ? t("br") : ""}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionContainer}>
                    {/* <Text style={styles.itemTotal}>
                      {i18n.language === "en" ? t("br") : ""}
                      {(item.total_price || 0).toFixed(2)}{" "}
                      {i18n.language === "amh" ? t("br") : ""}
                    </Text> */}
                    <Text>
                      {t("price")} / {t(`${item.variations?.unit}`)}{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveCartItems(item.variations.id)}
                      disabled={localLoading === item.variations.id}
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={24}
                        color="#ff4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                marginRight: 20,
              }}
            >
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>{t("total")} =</Text>
                <Text style={styles.totalAmount}>
                  {(cart.total || 0).toFixed(2)} {t("birr")}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: 33,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "60%",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    router.push("/(tabs)/shop");
                  }}
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#EB5B00",
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
                    {t("more")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.totalContainers}>
            <View style={styles.proceedCheckout}>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/collection/checkout")}
                // onPress={() => router.push("/(tabs)/collection/schedule")}
                // onPress={() => router.push("/(tabs)/orderinfo")}
                style={{
                  backgroundColor: "#445399",
                  padding: 18,
                  borderRadius: 35,
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {t("place")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <Toast />
    </SafeAreaView>
  );
};
const responsive = {
  fontSize: (size) => {
    const scaledSize = scale(size);
    return {
      fontSize: Platform.select({
        ios: scaledSize,
        android: scaledSize * 0.95,
      }),
    };
  },
  widthPercentage: (percentage) => (width * percentage) / 100,
  heightPercentage: (percentage) => (height * percentage) / 100,
};


const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
  headerContainer: {
    // height: 50,
    // backgroundColor: "#fff",
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // paddingHorizontal: 10,
     height: scale(50),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(10),
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    position: "relative",
    marginRight: 16,
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -8,
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
  backButton: {
    marginRight: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#445399",
    textAlign: "center",
    // fontFamily: "Poppins-Bold",
  },
  scrollContainers: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  productImage: {
    // width: 100,
    // height: 100,
    // borderRadius: 20,
    // marginRight: 16,
     width: responsive.widthPercentage(25),
    height: responsive.widthPercentage(25),
    borderRadius: scale(8),
    marginRight: scale(10),
  },
  detailsContainer: {
    // flexDirection: "column",
      flex: 1,
    marginLeft: scale(2),
  },
  productName: {
     ...responsive.fontSize(14),
    flexShrink: 1,
    marginBottom: scale(4),
    color:"#445399",
  },
  price: {
    // fontSize: 14,
    // color: "#666",
    ...responsive.fontSize(14),
    marginVertical: scale(4),
    color:"#445399",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    //  marginVertical: scale(8),
  },
  quantity: {
    // fontSize: 16,
    fontWeight: "500",
    // minWidth: 24,
    // textAlign: "center",
    color: "#445399",
     ...responsive.fontSize(16),
    marginHorizontal: scale(8),
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  actionContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: "600",
    // textAlign: "right",
  },
  deleteButton: {
    padding: 4,
  },
  totalContainers: {
    flexDirection: "column",
    justifyContent: "center",
    // alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center text horizontally
    alignItems: "center", // Center text vertically
    paddingVertical: 10, // Ensure proper spacing
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#445399",

    gap: 4,
    width: "95%", // Ensure proper width
    borderRadius: 12,
  },

  totalText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#445399",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#445399",
  },
  proceedCheckout: {
    paddingHorizontal: 12,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
});

export default CartScreen;
