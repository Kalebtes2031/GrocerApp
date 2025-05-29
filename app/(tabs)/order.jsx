import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Modal,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Link } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import Header from "@/components/Header";
import { fetchOrderHistory } from "@/hooks/useFetch";
import { format } from "date-fns";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { RadioButton } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#2D4150",
  secondary: "#445399",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#FF5722",
  background: "#F8FAFC",
  text: "#2D4150",
  muted: "#94A3B8",
};

const Order = () => {
  const { t, i18n } = useTranslation("order");
  const route = useRouter();
  const { isLogged } = useGlobalContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentType, setPaymentType] = useState("Direct Bank Payment");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrderHistorys();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const openModal = (order, buttonType, amount, need_delivery) => {
    setSelectedOrder({ order, buttonType, amount, need_delivery });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setPaymentType("Direct Bank Payment");
  };

  const handleReschedule = async (orderId) => {
    // setConfirmingId(orderId);
    try {
      setIsLoading(true);
      route.push(
        `/(tabs)/collection/schedule?orderId=${encodeURIComponent(
          JSON.stringify(orderId)
        )}`
      );
    } catch (err) {
      console.error("Confirm failed", err);
    } finally {
      // setConfirmingId(null);
      setIsLoading(false);
    }
  };

  const handleSubmitPayment = () => {
    const { order, buttonType, amount, need_delivery } = selectedOrder;
    if (paymentType === "Direct Bank Payment") {
      handleBankPayment(order, buttonType, amount, need_delivery);
    }
    closeModal();
  };
  const handleBankPayment = (order_id, buttonType, amount, need_delivery) => {
    if (buttonType === "advance") {
      amount = (amount * 0.3).toFixed(2);
    }
    console.log(order_id);
    console.log("another one: ", buttonType);
    console.log(amount);
    const paymentData = {
      orderId: order_id,
      amountToPay: amount,
      paymentStatus: buttonType,
      need_delivery: need_delivery,
    };
    route.push(
      `/(tabs)/collection/directpayment?paymentData=${encodeURIComponent(
        JSON.stringify(paymentData)
      )}`
    );
  };

  const fetchOrderHistorys = async () => {
    try {
      const result = await fetchOrderHistory();
      // Sort the orders in descending order (newest first)
      const sortedResult = result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedResult);
      console.log("Fetched orders:", sortedResult);
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogged) fetchOrderHistorys();
  }, [isLogged]);

  // helper functions outside component
  const renderPaymentIcon = (status) => {
    const iconMap = {
      "Fully Paid": { name: "check-circle", color: "green" },
      Pending: { name: "exclamation-circle", color: "yellow" },
      "On Delivery": { name: "check-circle", color: "green" },
      default: { name: "times-circle", color: "red" },
    };

    const { name, color } = iconMap[status] || iconMap.default;
    return <FontAwesome name={name} style={[styles.icon, styles[color]]} />;
  };

  const getTranslatedPaymentStatus = (status) => {
    const translations = {
      en: {
        "Fully Paid": "Fully Paid",
        Pending: "Pending",
        "Partial Payment": "Partial Payment",
        "On Delivery": "Fully Paid",
        Cancel: "Cancel",
      },
      amh: {
        "Fully Paid": "ሙሉ ተከፍሉዋል",
        Pending: "ምንም አልተከፈለም",
        "Partial Payment": "ከፊል ክፍያ",
        Cancel: "ተሰርዟል",
      },
    };

    return translations[i18n.language][status] || status;
  };

  const renderOrderItems = (items) =>
    items.map((item) => (
      <View key={item.id} style={styles.itemContainer}>
        <View>
          <Image
            source={{
              uri:
                item.variant.product?.image || "https://via.placeholder.com/60",
            }}
            style={styles.productImage}
          />
          <Text>
            {t("price")} / {t(`${item.variant?.unit}`)}{" "}
          </Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>
            {i18n.language === "en"
              ? item.variant.product?.item_name
              : item.variant.product?.item_name_amh}{" "}
            {parseInt(item.variant?.quantity)}
            {t(`${item.variant?.unit}`)}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>
              {i18n.language === "en" ? t("br") : ""}
              {item.variant?.price}
              {i18n.language === "amh" ? t("br") : ""}
            </Text>
            <Text style={styles.itemQuantity}>x {item.quantity}</Text>
          </View>
          <Text style={styles.itemTotal}>
            = {i18n.language === "en" ? t("br") : ""}
            {item.total_price}
            {i18n.language === "amh" ? t("br") : ""}
          </Text>
        </View>
      </View>
    ));

  const statusTranslations = {
    assigned: {
      en: "Assigned",
      amh: "ሚያደርስ ሰው ተመድቧል",
    },
    confirmed: {
      en: "Confirmed",
      amh: "ተቀብሎዎታል",
    },
    accepted: {
      en: "Accepted",
      amh: "ተቀብሎዎታል",
    },
    outfordelivery: {
      en: "Out for delivery",
      amh: "ወደ እርስዎ እየመጣ ነው",
    },
    pending: {
      en: "Pending",
      amh: "ይጠብቁ",
    },
    cancelled: {
      en: "Cancelled",
      amh: "ተሰርዟል",
    },
    default: {
      en: "Unknown",
      amh: "አልታወቀም",
    },
  };

  const renderOrderStatus = (status) => {
    let statusStyle = {};
    let displayText = statusTranslations.default[i18n.language];

    switch (status.toLowerCase()) {
      case "assigned":
        statusStyle = styles.statusCompleted;
        displayText = statusTranslations.assigned[i18n.language];
        break;
      case "pending":
        statusStyle = styles.statusPending;
        displayText = statusTranslations.pending[i18n.language];
        break;
      case "cancelled":
        statusStyle = styles.statusCancelled;
        displayText = statusTranslations.cancelled[i18n.language];
        break;
      default:
        statusStyle = styles.statusDefault;
    }

    return (
      <View style={[styles.statusBadge, statusStyle]}>
        <Text style={styles.statusText}>{displayText}</Text>
      </View>
    );
  };

  const renderOrders = () => {
    if (loading) {
      return (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      );
    }

    if (!orders.length) {
      return <Text style={styles.noOrdersText}>{t("no")}</Text>;
    }

    return orders.map((order) => (
      <View key={order.id} style={styles.orderContainer}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>
            {t("order")} #Yas-{order.id}
          </Text>
          <Text style={{ fontSize: 10, fontWeight: "600", color: "#445399",}}>
            {order.need_delivery ? t("need_delivery") : t("self_pickup")}
          </Text>
          {/* {renderOrderStatus(order.status)} */}
        </View>

        {/* <Text style={styles.sectionHeader}>{t("items")}</Text> */}
        {renderOrderItems(order.items)}

        <View style={styles.totalContainer}>
          <Text style={styles.orderTotal}>{t("ordertotal")}:</Text>
          <Text
            style={[styles.orderTotal, { marginLeft: 24, textAlign: "center" }]}
          >
            {i18n.language === "en" ? t("br") : ""} {order.total}{" "}
            {i18n.language === "amh" ? t("br") : ""}
          </Text>
        </View>
        <View style={styles.responsiveContainer}>
          {/* Order Total */}
          {/* <View style={styles.rowContainer}>
            <Text style={[styles.boldLabel, styles.flexLabel]}>
              {t("ordertotal")}:
            </Text>
            <Text style={styles.flexValue}>
              {i18n.language === "en" ? t("br") : ""}
              {order.total}
              {i18n.language === "amh" ? t("br") : ""}
            </Text>
          </View> */}

          {/* Scheduled Delivery */}
          <View style={styles.rowContainer}>
            <Text style={[styles.boldLabel, styles.flexLabel]}>
              {t("scheduled")}:
            </Text>

            {order?.scheduled_delivery ? (
              <Text style={styles.flexValue}>
                {" "}
                {new Date(order.scheduled_delivery).toLocaleString()}
              </Text>
            ) : (
              <Text style={styles.flexValue}>{t("not_scheduled")}</Text>
            )}
          </View>
          {order?.scheduled_delivery ? (
            ""
          ) : (
            <TouchableOpacity
              onPress={() => handleReschedule(order.id)}
              style={[
                styles.button2,
                { backgroundColor: COLORS.error, marginTop: 4 },
              ]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: i18n.language === "en" ? 15 : 12,
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  {t("reschedule")}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {/* Payment Status */}
          <View style={styles.paymentRow}>
            <Text style={[styles.boldLabel, styles.flexLabel]}>
              {t("payment")}:
            </Text>
            <View style={styles.statusContainer}>
              {renderPaymentIcon(order.payment_status)}
              <Text style={[styles.flexValue, styles.statusText]}>
                {getTranslatedPaymentStatus(order.payment_status)}
              </Text>
            </View>
          </View>

          {/* Payment Action Button */}
          {order.payment_status === "Pending" && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.fullPayment]}
                onPress={() =>
                  openModal(
                    order.id,
                    "full_payment",
                    order.total,
                    order.need_delivery
                  )
                }
              >
                <Text style={styles.buttonText}>{t("full")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {!isLogged ? (
        <View style={styles.loginPromptContainer}>
          <Text style={styles.loginPromptText}>
            {"please"}{" "}
            <Link href="/(auth)/sign-in" style={styles.loginLink}>
              {"login"}
            </Link>{" "}
            {t("view")}
          </Text>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          {/* <Header /> */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* <Text className="text-primary" style={styles.pageTitle}>
              {t("myorders")}
            </Text>
            <Text style={styles.ordersCount}>
              {orders.length} {t("found")}
            </Text> */}
            <View style={styles.headerContainer}>
              {/* <Header /> */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "start",
                  // paddingHorizontal: 10,
                  // paddingTop: 4,
                }}
              >
                {/* <TouchableOpacity
                  onPress={() => route.back()}
                  style={{
                    // marginHorizontal: 10,
                    paddingHorizontal: 2,
                    borderWidth: 1,
                    borderRadius: 52,
                    paddingVertical: 2,
                    borderColor: "#445399",
                  }}
                  className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
                >
                  <Ionicons name="arrow-back" size={24} color="#445399" />
                </TouchableOpacity> */}
                <View></View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#445399",
                    width: "100%",
                    borderTopRightRadius: 8,
                    borderTopLeftRadius: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    className="font-poppins-bold text-center text-primary mb-4"
                    style={styles.headerTitle}
                  >
                    {t("myorders")}
                  </Text>
                </View>
                <View></View>
              </View>
            </View>
            {renderOrders()}
          </ScrollView>
          <Modal
            visible={isModalOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t("choose")}</Text>
                <View style={styles.radioGroup}>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="Direct Bank Payment"
                      status={
                        paymentType === "Direct Bank Payment"
                          ? "checked"
                          : "unchecked"
                      }
                      color="#445399"
                      onPress={() => setPaymentType("Direct Bank Payment")}
                    />
                    <Text style={styles.radioLabel}>{t("bank")}</Text>
                  </View>
                </View>
                <View style={styles.buttonContainers}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handleSubmitPayment}
                  >
                    <Text style={styles.proceedButtonText}>{t("proceed")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
};

export default Order;

const styles = StyleSheet.create({
  button2: {
    width: "100%",
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 58,
    alignItems: "center",
  },
  responsiveContainer: {
    paddingRight: 10,
    //  backgroundColor:"red"
    // marginTop: 12,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginVertical: 2,
    flexWrap: "wrap",
    // backgroundColor:"red"
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    // marginVertical: 6,
    flexWrap: "wrap",
  },
  boldLabel: {
    fontSize: 14,
    color: "#445399",
    fontWeight: "600",
    flexShrink: 0, // Prevent label from shrinking
    minWidth: 70, // Minimum width for labels
  },
  flexLabel: {
    marginRight: 8,
  },
  flexValue: {
    flex: 1,
    fontSize: 14,
    flexShrink: 1, // Allow text wrapping
    flexWrap: "wrap",
    color: "#445399",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusText: {
    marginLeft: 6,
  },
  buttonContainer: {
    marginTop: 15,
    alignItems: "center",
    // width:"100%"
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 58,
    // minWidth: 120,
    alignItems: "center",
    width: "100%",
  },
  fullPayment: {
    backgroundColor: "#445399",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  icon: {
    fontSize: 18,
  },
  green: { color: "#4CAF50" },
  yellow: { color: "#FFC107" },
  red: { color: "#F44336" },
  headerContainer: {
    // height: 60,
    backgroundColor: "#fff",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    marginBottom: 13,
    // paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 20,
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginPromptText: {
    fontSize: 16,
    color: "#666",
  },
  loginLink: {
    color: "#007AFF",
    fontWeight: "600",
  },
  pageTitle: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  ordersCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  orderContainer: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    // shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width:"100%",
    borderBottomColor: "#445399",
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 8,
    // marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#445399",
    width: "50%",
    // textAlign: "center",
    // borderBottomColor: "#445399",
    // borderBottomWidth: 1,
    // paddingBottom: 4,
    // marginBottom: 8,
  },
  orderMeta: {
    marginBottom: 6,
    gap: 4,
  },
  orderInfo: {
    fontSize: 14,
    // marginBottom: 4,
    color: "#333",
  },

  metaText: {
    fontSize: 13,
    color: "#445399",
    fontWeight: 600,
    marginLeft: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  // statusText: {
  //   fontSize: 10,
  //   fontWeight: "400",
  //   textTransform: "uppercase",
  // },
  statusCompleted: {
    backgroundColor: "rgba(63, 176, 39, 0.8)",
  },
  statusPending: {
    backgroundColor: "#FFF3E0",
  },
  statusCancelled: {
    backgroundColor: "#FFEBEE",
  },
  statusDefault: {
    backgroundColor: "#F5F5F5",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: "contain",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    // marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginTop: 6,
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#445399",
    width: "100%",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    // backgroundColor:"red",
    width: "50%",
  },
  noOrdersText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
  paymentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "conter",
  },
  icon: {
    marginRight: 8,
    fontSize: 14, // Adjust for your needs
  },
  green: {
    color: "#16a34a", // Tailwind green-600
  },
  yellow: {
    color: "#facc15", // Tailwind yellow-500
  },
  orange: {
    color: "#f97316", // Tailwind orange-500
  },
  red: {
    color: "#ef4444", // Tailwind red-500
  },
  text: {
    fontWeight: "500", // Tailwind font-medium
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    color: "#445399",
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioLabel: {
    fontSize: 14,
    color: "#333",
  },
  buttonContainers: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 14,
  },
  proceedButton: {
    backgroundColor: "#445399", // Replace with your desired color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  // button: {
  //   height: 30,
  //   paddingVertical: 4,
  //   paddingHorizontal: 12,
  //   borderRadius: 6,
  //   borderWidth: 1,
  //   borderColor: "#D1D5DB", // Gray-300
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  buttonText: {
    fontSize: 12,
    fontFamily: "System", // Replace with your font family if custom
    color: "white",
  },
  partialPaymentButton: {
    backgroundColor: "#F59E0B", // Yellow-500
    marginTop: 12,
  },
  pendingButtonsContainer: {
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 28,
    marginTop: 12,
  },
  fullPaymentButton: {
    backgroundColor: "#A67C52", // Primary-lightbrown
  },
  advancePaymentButton: {
    backgroundColor: "#F97316", // Orange-500
  },
});
