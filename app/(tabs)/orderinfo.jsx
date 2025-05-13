import { fetchOrderDetail } from "@/hooks/useFetch";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

export default function OrderInfo() {
  const { t, i18n } = useTranslation("orderinfo");
  const route = useRouter();
  const { orderId } = useLocalSearchParams();
  const cleanedOrderId = JSON.parse(orderId);
  // let num = 42;
  // const orderId = num;
  const [ourOrder, setOurOrder] = useState({});

  const fetchOrderDetailBasedId = async () => {
    try {
      const order = await fetchOrderDetail(cleanedOrderId);
      setOurOrder(order);
      console.log("our order detail:", order);
    } catch (error) {
      console.error("Error fetching order detail", error);
    }
  };
  useEffect(() => {
    fetchOrderDetailBasedId();
  }, [orderId]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.pentagonContainer}>
            {/* Top Triangle */}
            {/* <View style={styles.triangle} /> */}

            {/* Bottom Rectangle */}
            <View style={styles.rectangle}>
              <Text style={styles.text}>{t("your")}</Text>
              <Text style={styles.text2}>{t("thank")}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectiona}>
          <Text
          style={{
            textAlign: "center",
            color: "#445399",
            fontSize: 15,
            fontWeight: "bold",
            marginBottom: 10,
          }}
        >
          {t("orderinfo")}
        </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              marginHorizontal: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>{t("number")} : </Text>
              <Text>#Yas-{ourOrder.id}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              marginHorizontal: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>{t("date")} : </Text>
              <Text>{new Date(ourOrder.created_at).toLocaleString()}</Text>
              {/* <Text>{format(new Date(ourOrder.schedule_delivery), "MMM dd, yyyy HH:mm")}</Text> */}
            </View>
          </View>
          <View 
            style={{
              flexDirection: "column",
              justifyContent: "center",
              paddingHorizontal:22,
            }}
          >

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#445399",
            }}
          >
            <Text style={styles.sectionTitle}>{t("product")}</Text>
            <Text style={styles.sectionTitle}>{t("price")}</Text>
          </View>
          {ourOrder?.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "start",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={styles.productName}>
                    {i18n.language === "en"
                      ? item.variant?.product?.item_name
                      : item.variant?.product?.item_name_amh}
                  </Text>
                  <Text style={styles.quantity1}>
                    {parseInt(item.variant.quantity)}
                    {t(`${item.variant.unit}`)}
                  </Text>
                </View>
                <Text style={styles.quantity}>
                  {t("qty")}: {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {i18n.language === "en" ? t("br") : ""}
                {item.total_price.toFixed(2)}
                {i18n.language === "amh" ? t("br") : ""}
              </Text>
            </View>
          ))}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "",
              marginHorizontal: 23,
              // borderWidth: 1,
              borderBottomWidth:1,
              marginBottom:11,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "flex-end", alignItems:"flex-end" }}
            >
              <Text style={{textAlign:"right"}}>{t("total")} : </Text>
              <Text>
                {i18n.language === "en" ? t("br") : ""} {ourOrder.total}{" "}
                {i18n.language === "amh" ? t("br") : ""}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              marginHorizontal: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text>{t("payment")} : </Text>
              <Text>
                {ourOrder.payment_option === "Cash" ? t("cash") : t("bank")}
              </Text>
            </View>
          </View>
          {ourOrder?.payment?.bank_name && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "center",
                marginHorizontal: 23,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>{t("selectedbank")} : </Text>
                <Text>{ourOrder.payment.bank_name}</Text>
              </View>
            </View>
          )}

          <View
            style={{
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "start",
              margin: 23,
            }}
          >
            <Text
              className="text-primary"
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              {t("address")}
            </Text>
            <Text>{ourOrder.customer_address}</Text>
            {/* <Text>ADDIS ABABA, ETHIOPIA</Text> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "start",
                marginTop: 3,
              }}
            >
              <Text>{t("name")} : </Text>
              <Text style={{ textTransform: "uppercase" }}>
                {ourOrder.first_name} {ourOrder.last_name}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "start",
                marginTop: 3,
              }}
            >
              <Text>{t("email")} : </Text>
              <Text>{ourOrder.email}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "start",
                marginTop: 3,
              }}
            >
              <Text>{t("phone")} : </Text>
              <Text>{ourOrder.phone_number}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.placeOrderButton}
          // onPress={handlePlaceOrder}
          onPress={() => route.push("/trackorder")}
          //   disabled={isLoading}
        >
          <Text style={styles.placeOrderText}>
            {/* {isLoading ? "Pay Now" : "Pay Now"} */}
            {t("track")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    color: "#444",
    
    // marginBottom: 4,
  },
  quantity1: {
    fontSize: 14,
    color: "#666",
    paddingBottom: 2,
  },
  quantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "start",
    backgroundColor: "#fff",
    marginHorizontal: 2,
  },
  pentagonContainer: {
    alignItems: "center",
    marginTop: 32,
    justifyContent: "center",
    width: 345, // Increased size
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5, // For Android
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 170, // Half of container width
    borderRightWidth: 170,
    borderBottomWidth: 70, // Increased triangle height
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4A55A2", // Updated color
    position: "relative",
    zIndex: 1,
  },
  rectangle: {
    width: 345,
    height: 150, // Increased height
    backgroundColor: "#55B051",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopRightRadius: 200,
    borderTopLeftRadius: 200,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -15,
    paddingBottom: 40,
    marginHorizontal:3
  },
  text: {
    color: "white",
    fontSize: 20,
    letterSpacing: 1.2,
    fontWeight: "600",
    fontFamily: "System", // Use system font for clean look
    // textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 30,
  },
  text2: {
    color: "white",
    fontSize: 15,
    letterSpacing: 1.2,
    fontWeight: "600",
    fontFamily: "System", // Use system font for clean look
    // textTransform: "uppercase",
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingVertical: 26,
    paddingBottom: 100,
    backgroundColor: "#fff",
    gap: 6,
  },
  sectiona: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#445399",
  },
  placeOrderButton: {
    backgroundColor: "#445399",
    borderRadius: 38,
    padding: 16,
    alignItems: "center",
  },
  placeOrderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    width: "100%",
    textAlign: "center",
  },
});
