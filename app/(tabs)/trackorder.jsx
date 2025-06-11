import { confirmOrder, fetchOrderHistory , givingRate} from "@/hooks/useFetch";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedCountdown from "@/components/AnimatedCountdown";
import { useTranslation } from "react-i18next";
import OrderMapView from "@/components/OrderMapView";
import ShopTracking from "@/components/ShopTracking";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Rating } from "react-native-ratings";

// Color Constants
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
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABS = ["active", "missed", "completed"];
const TAB_COUNT = TABS.length;
const INACTIVE_SCALE = 0.9;
const INACTIVE_OPACITY = 0.6;

const OrderTrackingScreen = () => {
  const { t, i18n } = useTranslation("track");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
    const [hasRated, setHasRated] = useState(false);
  const [showModal, setShowModal] = useState(false);
   const [stars, setStars] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
const [rateOrderId, setRateOrderId] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const sectionListRef = useRef(null);

  const handleRouting = () => {
    if (!hasRated) {
      setShowModal(true);
    } else {
      route.push("/(tabs)/trackorder");
    }
  };

  const handleTabPress = (index) => {
    setActiveTab(index);
    Animated.spring(scrollX, {
      toValue: index * SCREEN_WIDTH,
      useNativeDriver: true,
    }).start();

    sectionListRef.current?.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      animated: false,
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchOrderHistory();
      // Sort orders descending by id
      const sortedData = data.sort((a, b) => b.id - a.id);
      setOrders(sortedData);

      setActiveTab(0);
      Animated.spring(scrollX, {
    toValue: 0,
    useNativeDriver: true,
  }).start();
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleReschedule = async (orderId) => {
    // setConfirmingId(orderId);
    try {
      setIsLoading(true);
      router.push(
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

  const handleConfirm = async (orderId) => {
    setConfirmingId(orderId);
    try {
      // setIsLoading(true)
      await confirmOrder(orderId);
      setRateOrderId(orderId);
      setShowModal(true)  
      await loadData(); // re‑fetch to update sections
    } catch (err) {
      console.error("Confirm failed", err);
    } finally {
      setConfirmingId(null);
      // setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }, [])
  );

  const formatCountdown = (scheduledTime) => {
    const scheduled = new Date(scheduledTime);
    const nowDate = new Date(now);
    const diff = scheduled - nowDate;

    if (diff < 0) {
      const daysLate = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return {
        status: "Delayed",
        color: COLORS.error,
        details: `${daysLate} day${daysLate !== 1 ? "s" : ""} overdue`,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      status: `${days}d ${hours}h ${minutes}m ${seconds}s `,
      color: days === 0 && hours < 2 ? COLORS.warning : COLORS.success,
      details: `Due by ${new Date(scheduledTime).toLocaleString()}`,
    };
  };

  const renderOrderItem = ({ item, section }) => {
    const nowDate = new Date(now);
    const scheduled = new Date(item.scheduled_delivery);
    const isMissed = scheduled < nowDate && item.status !== "Delivered";
    const shouldShowMap = section.title === t("active") && item.need_delivery;
    const dontshowstatus =
      section.title === t("missed") || item.need_delivery === false;
    const dontshowtime =
      section.title === t("missed") || section.title === t("completed");
    const timeInfo =
      item.status === "Delivered"
        ? {
            status: "Delivered",
            color: COLORS.success,
            details: `Delivered on ${scheduled.toLocaleDateString()}`,
          }
        : isMissed
        ? {
            status: "Missed",
            color: COLORS.error,
            details: `Scheduled for ${scheduled.toLocaleDateString()}`,
          }
        : formatCountdown(item.scheduled_delivery);

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <LinearGradient
          colors={[`${timeInfo.color}25`, "#FFFFFF"]}
          style={styles.cardHeaderNew}
        >
          <View style={styles.headerLeft}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={styles.orderNumber}>
                {t("order")} #Yas-{item.id}
              </Text>
              <View
              // style={{
              //   backgroundColor: "#445399",
              //   borderRadius: 45,
              //   paddingVertical: 2,
              //   paddingHorizontal: 6,
              // }}
              >
                <Text style={styles.statusText}>
                  {item.need_delivery ? t("need_delivery") : t("self_pickup")}
                </Text>
              </View>
            </View>
          </View>

          {item.scheduled_delivery && // 1) must exist
            !isNaN(new Date(item.scheduled_delivery).getTime()) && // 2) must parse
            new Date(item.scheduled_delivery) < new Date() && // 3) in the past
            item.status !== "Delivered" && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                }}
              >
                <TouchableOpacity
                  onPress={() => handleReschedule(item.id)}
                  style={[
                    styles.button2,
                    { backgroundColor: COLORS.error, marginTop: 0 },
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
              </View>
            )}
          <View
            style={
              {
                // padding: 1,
                // height:200,
              }
            }
          >
            {/* <Image
              style={{
                padding: 1,
                height: 150,
                width: 300,
              }}
              source={require("@/assets/images/yasonmap.jpg")}
            /> */}

            {shouldShowMap && <OrderMapView order={item} />}
          </View>
          <View style={styles.countdownWrapper}>
            {item.status === "Delivered" ? (
              <View style={styles.deliveredBadge}>
                <Icon name="check-circle" size={18} color={timeInfo.color} />
                <Text style={[styles.deliveredText, { color: timeInfo.color }]}>
                  {t("delivered")}
                </Text>
              </View>
            ) : (
              !dontshowtime && (
                <AnimatedCountdown
                  scheduledTime={item.scheduled_delivery}
                  warningColor={COLORS.warning}
                  successColor={COLORS.success}
                />
              )
            )}
          </View>
        </LinearGradient>

        {/* Time Progress */}
        {/* <View style={styles.timeContainer}>
          <Text style={styles.timeMainText}>{timeInfo.details}</Text>
          {item.status !== "Delivered" && (
            <Text style={styles.timeSubText}>
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          )}
        </View> */}

        {/* Delivery Progress */}
        {!dontshowstatus && (
          <ShopTracking status={item.status} prepared={item.prepared} />
        )}

        {/* Order Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>{t("summary")}</Text>

          {item.items.map((product, index) => (
            <View key={`item-${item.id}-${index}`} style={styles.productItem}>
              <Image
                source={{ uri: product.variant.product.image }}
                style={styles.productImage}
              />
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingRight: 22,
                }}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {i18n.language === "en"
                      ? product.variant.product.item_name
                      : product.variant.product.item_name_amh}
                  </Text>

                  <Text style={styles.productMeta}>
                    {product.quantity} x {product.variant.price}{" "}
                    {/* {i18n.language === "en" ? t("br") : ""}
                    {product.total_price}{" "}
                    {i18n.language === "amh" ? t("br") : ""} */}
                  </Text>
                </View>
                <View>
                  <Text style={styles.productName}>{t("subtotal")}</Text>

                  <Text style={styles.productMeta}>
                    {i18n.language === "en" ? t("br") : ""}
                    {product.total_price}{" "}
                    {i18n.language === "amh" ? t("br") : ""}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Text style={styles.totalLabel}>{t("totalamount")}:</Text>
              <Text style={styles.totalValue}>
                {i18n.language === "en" ? t("br") : ""}
                {item.total}
                {i18n.language === "amh" ? t("br") : ""}
              </Text>
            </View>
            {item.need_delivery === false &&
              item.status === "Pending" &&
              section.title !== t("missed") && (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    paddingRight: 12,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      {
                        backgroundColor: "#4CAF50",
                        width: 90,
                        // marginLeft: 22,
                        paddingVertical: 10,
                        borderRadius: 58,
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => handleConfirm(item.id)}
                    disabled={confirmingId === item.id}
                  >
                    <Text style={styles.buttonText}>
                      {confirmingId === item.id ? t("waiting") : t("confirm")}
                    </Text>
                  </TouchableOpacity>
              
                </View>
              )}
          </View>
        </View>

        {/* Delivery Info */}
        {item.need_delivery === true && (
          <View style={styles.deliveryInfo}>
            <Icon name="local-shipping" size={20} color={COLORS.secondary} />
            {/* <View style={styles.deliveryDetails}> */}
            {/* <Text style={styles.driverText}>
              {item.delivery_person || t("await")}
            </Text> */}
            {/* <Text style={styles.contactText}>Contact: {item.phone_number}</Text> */}
            {/* </View> */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "center",
              }}
            >
              <View>
                {item?.delivery_person ? (
                  item?.delivery_person?.user?.image ? (
                    <Image
                      source={{
                        uri: item?.delivery_person?.user?.image,
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 38,
                        marginRight: 12,
                        borderWidth: 1,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 38,
                        marginRight: 12,
                        borderWidth: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon name="person" size={40} color="#666" />
                    </View>
                  )
                ) : (
                  <Text>{t("notassigned")}</Text>
                )}
              </View>
              <View>
                <Text>
                  {item?.delivery_person?.user?.first_name}{" "}
                  {item?.delivery_person?.user?.last_name}
                </Text>
                <Text>{item?.delivery_person?.user.phone_number}</Text>
              </View>
            </View>
            {item.status === "In Transit" && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#4CAF50" }]}
                onPress={() => handleConfirm(item.id)}
                disabled={confirmingId === item.id}
              >
                <Text style={styles.buttonText}>
                  {confirmingId === item.id ? t("waiting") : t("confirm")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          const dynamicWidth = isActive
            ? SCREEN_WIDTH * 0.4 // 40% width when active
            : (SCREEN_WIDTH * 0.6) / (TAB_COUNT - 1); // split remaining

          return (
            <Animated.View
              key={tab}
              style={[
                styles.tabWrapper,
                {
                  width: dynamicWidth,
                  transform: [{ scale: isActive ? 1 : INACTIVE_SCALE }],
                  opacity: isActive ? 1 : INACTIVE_OPACITY,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => handleTabPress(index)}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {t(tab)}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Animated Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
                  outputRange: [0, -SCREEN_WIDTH, -SCREEN_WIDTH * 2],
                }),
              },
            ],
          },
        ]}
      >
        {TABS.map((tab, index) => (
          <View
            key={tab}
            style={{ width: SCREEN_WIDTH - 23, marginHorizontal: 3 }}
          >
            <SectionList
              key={tab}
              ref={sectionListRef}
              sections={[
                {
                  title: t(tab),
                  data: orders.filter((o) => {
                    // first, grab and parse the delivery date
                    const sd = o.scheduled_delivery;
                    const ts = sd ? Date.parse(sd) : NaN;

                    // make sure it was a real date
                    if (isNaN(ts)) {
                      return false;
                    }

                    // now compare
                    if (tab === "active") {
                      return o.status !== "Delivered" && ts >= Date.now();
                    }
                    if (tab === "missed") {
                      return o.status !== "Delivered" && ts < Date.now();
                    }
                    return o.status === "Delivered";
                  }),
                },
              ]}
              renderItem={(props) => renderOrderItem(props)}
              // renderSectionHeader={({ section }) => (
              //   <Text style={styles.sectionHeader}>{section.title}</Text>
              // )}
              renderSectionFooter={({ section }) => {
                if (section.data.length === 0) {
                  return (
                    <View style={styles.emptySectionContainer}>
                      <Text style={styles.emptySectionText}>
                        {t(`no${tab}delivery`)}
                      </Text>
                    </View>
                  );
                }
                return null;
              }}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </View>
        ))}
      </Animated.View>
       {showModal && (
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowModal(false);
                setRateOrderId(null);
                setStars(0);
                setComment("");
                // Now re-fetch orders so the status updates on screen:
                loadData();
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t("rateExperience")}</Text>
              <Text style={styles.modalSubtitle}>{t("rateSubtitle")}</Text>

              <Rating
                type="star"
                ratingCount={5}
                imageSize={40}
                showRating={false}
                startingValue={stars}
                onFinishRating={setStars}
                style={styles.rating}
                ratingColor="#FFC107"
                ratingBackgroundColor="#E5E7EB"
              />

              <TextInput
                style={styles.commentInput}
                placeholder={t("commentPlaceholder")}
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={async () => {
                  if (!stars) return;
                  setSubmitting(true);
                  try {
                    await givingRate(rateOrderId, stars, comment);
                    setHasRated(true);
                    Alert.alert(t("thankYou"), t("feedbackSubmitted"), [
                      {
                        text: "OK",
                        onPress: () => {
                          setShowModal(false);
                          setRateOrderId(null);
                          setStars(0);
                          setComment("");
                          loadData(); // refresh orders now that rating is done
                        },
                      },
                    ]);
                  } catch (error) {
                    Alert.alert(t("error"), t("submitError"));
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {t("submitRating")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  modalContent: {
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 25,
  },
  rating: {
    paddingVertical: 15,
    alignSelf: "center",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 25,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  submitButton: {
    backgroundColor: "#445399",
    paddingVertical: 16,
    borderRadius: 54,
    alignItems: "center",
    shadowColor: "#445399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    width:"100%",
    textAlign: "center",
  },
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
  emptySectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptySectionText: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    // paddingHorizontal: 6,
  },
  tabWrapper: {
    alignItems: "center",
    paddingHorizontal: 12,
    //  backgroundColor: "red",
  },
  tabButton: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#445399",
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#4CAF50",
    // borderBottomWidth: 3,
    // borderBottomColor: "#FF9800",
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
    textAlign: "center",
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  activeTab: {
    // borderBottomWidth: 2,
    // borderBottomColor: COLORS.secondary,
    backgroundColor: "#4CAF50",
    // backgroundColor:"#EB5B00",
  },
  // tabText: {
  //   fontSize: 14,
  //   color:"white",
  //   fontWeight: "500",
  //   textAlign:"center",
  // },
  activeTabText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  contentContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 3,
    justifyContent: "center",
    gap: 16,
    // alignItems:"center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  listContent: {
    // paddingLeft: 8,
    paddingBottom: 56,
    // backgroundColor:"red",
    // width:300
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
  },
  cardHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  button: {
    width: 90,
    marginLeft: 22,
    paddingVertical: 10,
    borderRadius: 58,
    alignItems: "center",
  },
  button2: {
    width: 130,
    marginLeft: 12,
    paddingVertical: 10,
    borderRadius: 58,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    width: "100%",
    textAlign: "center",
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.muted,
    // padding: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  cardHeaderNew: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "start",
    // padding: 12,
    gap: 2,
    paddingleft: 16,
    borderRadius: 10,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.15,
    // shadowRadius: 4,
    // elevation: 3,
    // marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D4150",
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D4150",
  },
  countdownWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  deliveredText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    width: "100%",
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#445399",
    marginBottom: 4,
    marginRight: 4,
    width:"100%",
    textAlign: "center",
    // backgroundColor: "red",
  },
  timeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  timeMainText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  timeSubText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  progressStep: {
    alignItems: "center",
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  detailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  productItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: "contain",
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  productMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    width: 83,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  deliveryDetails: {
    flex: 1,
  },
  driverText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  contactText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    backgroundColor: "#445399",
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    textAlign: "center",
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.muted,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.muted,
  },
});

export default OrderTrackingScreen;
