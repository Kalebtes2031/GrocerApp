import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCart } from "@/context/CartProvider";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useWatchlist } from "@/context/WatchlistProvider";
import { useTranslation } from "react-i18next";

const CartScreen = () => {
  const { t, i18n } = useTranslation("cartscreen");
  const { watchlist } = useWatchlist();
  const { cart, loadCartData, updateItemQuantity, removeItemFromCart } =
    useCart();
  const [localLoading, setLocalLoading] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log("check the cart now: ", cart);
  }, []);
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity <= 0) return;

    try {
      setLocalLoading(itemId);
      await updateItemQuantity(itemId, newQuantity);
      await loadCartData();
      Toast.show({
        type: "success",
        text1: "Cart updated",
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: "Please try again",
      });
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
        text1: "Item removed",
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
    router.push(`/carddetail?product=${encodeURIComponent(JSON.stringify(product))}`);
  };
  if (!cart || !cart.items) {
    return (
      // <View style={styles.emptyContainer}>
      //   <MaterialIcons name="remove-shopping-cart" size={60} color="#ccc" />
      //   <Text style={styles.emptyText}>Your cart is empty</Text>
      // </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
                width:10,
                height:10,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                padding: 1,
                
                // 

              
              }}
              // className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
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

            className="font-poppins-bold text-center text-primary mb-4"
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
                onPress={() => router.back()}
                style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
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
              style={styles.headerTitle}
            >
              {t("shopping")}
            </Text>

            <View style={styles.scrollContainers}>
              {cart.items.map((item) => (
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
                      className="flex"
                      style={{
                        // display: "flex",
                        // flexDirection: "row",
                        // alignItems: "center",
                        // gap: 5,
                        // backgroundColor:"red",
                        width:120,
                      }}
                    >
                      <Text style={styles.productName}>
                        {i18n.language === "en"
                          ? item?.item_name
                          : item?.item_name_amh}
                          {"  "}
                          {parseInt(item?.variations?.quantity)}
                        {item?.variations?.unit}
                      </Text>
                      <Text style={styles.productName}>
                       
                      </Text>
                    </View>
                    <Text style={styles.price}>
                      {i18n.language === "en" ? t("br") : ""}
                      {parseFloat(item.variations?.price || "0").toFixed(2)} {" "}
                      {i18n.language === "amh" ? t("br") : ""}
                    </Text>

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
                            color={item.quantity === 1 ? "#ccc" : "#000"}
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
                            color="#000"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.actionContainer}>
                    <Text style={styles.itemTotal}>
                      {i18n.language === "en" ? t("br") : ""}
                      {(item.total_price || 0).toFixed(2)}{" "}
                      {i18n.language === "amh" ? t("br") : ""}
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

// Add these new styles to your StyleSheet
const styles = StyleSheet.create({
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
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // emptyContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // emptyText: {
  //   fontSize: 18,
  //   color: "#666",
  //   marginTop: 10,
  // },
  // headerContainer: {
  //   height: 60,
  //   backgroundColor: "#fff",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 10,
  // },
  iconWrapper: {
    position: "relative",
    marginRight: 16,
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -8,
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
  backButton: {
    marginRight: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#445399",
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },
  // ... keep the rest of your existing styles
  scrollContainers: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#D6F3D5",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  detailsContainer: {
    display:"flex",
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 1,
  },
  price: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    // marginTop: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "500",
    minWidth: 24,
    textAlign: "center",
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
    backgroundColor: "#75767C",
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
    gap: 4,
    width: "70%", // Ensure proper width
    borderRadius: 42,
  },

  totalText: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
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
