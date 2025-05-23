import Header from "@/components/Header";
import { useCart } from "@/context/CartProvider";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { createOrder, USER_PROFILE } from "@/hooks/useFetch";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
// import { GebetaMap, MapMarker } from "@gebeta/tiles";
// import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const GOOGLE_PLACES_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY";

const CheckoutPage = () => {
  const { t, i18n } = useTranslation("checkout");
  const { cart, loadCartData } = useCart();
  const { user } = useGlobalContext();
  const route = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [amountToPay, setAmountToPay] = useState(null);
  const [selectedRadio, setSelectedRadio] = useState(false);
  const [selectedOption, setSelectedOption] = useState("directbanktransfer"); // Tracks the selected option
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  // selectedLocation: {latitude: number, longitude: number}
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationChoice, setLocationChoice] = useState("current");
  const [showMap, setShowMap] = useState(false);

  const choiceofpayment = () => {
    handleBankPayment();
  };
  const handleBankPayment = (paymentData) => {
    // const paymentData = {
    //   orderId,
    //   amountToPay,
    //   paymentStatus,
    //   // phone,
    //   // firstName,
    //   // lastName,
    //   // email,
    //   // ...other data,
    // };
    console.log("is the problem here, need for investigation:", paymentData);
    // Pass the paymentData as a query parameter
    route.push(
      `./directpayment?paymentData=${encodeURIComponent(
        JSON.stringify(paymentData)
      )}`
    );
  };

  const fetchCustomerProfile = async () => {
    try {
      // const profile = await USER_PROFILE();
      // console.log("Customer Profile:", profile);

      setPhone(user.phone_number || "");
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
    } catch (error) {
      console.error("Error fetching customer profile:", error);
    }
  };
  useEffect(() => {
    fetchCustomerProfile();
    // (async () => {
    //   const { status } = await Location.requestForegroundPermissionsAsync();
    //   if (status !== "granted") {
    //     Toast.show({
    //       type: "error",
    //       text1: "Location permission not granted",
    //       visibilityTime: 2000,
    //     });
    //     return;
    //   }
    //   const location = await Location.getCurrentPositionAsync({});
    //   const coords = {
    //     latitude: location.coords.latitude,
    //     longitude: location.coords.longitude,
    //   };
    //   setCurrentLocation(coords);
    //   // Set the default selected location to current location
    //   setSelectedLocation(coords);
    // })();
  }, [user]);

  const handlePlaceOrder = async () => {
    // setShowModal(true);
    if (cart.total < 1 || cart.items.length < 1) {
      Toast.show({
        type: "error",
        text1:
          "Your cart is empty. Please add items to your cart before placing an order.",
        visibilityTime: 2000,
      });
      return;
    }
    // if (!selectedLocation) {
    //   Toast.show({
    //     type: "error",
    //     text1: "Please select your delivery location.",
    //     visibilityTime: 2000,
    //   });
    //   return;
    // }
    setIsLoading(true); // Show loading spinner
    const paymentOptionValue =
      selectedOption === "directbanktransfer"
        ? "Bank Transfer"
        : selectedOption === "cashondelivery"
        ? "Cash"
        : "Pending"; // fallback (optional)

    const orderinfo = {
      phone_number: phone,
      first_name: firstName,
      last_name: lastName,
      email: email,
      payment_option: paymentOptionValue,
      // customer_latitude: selectedLocation.latitude,
      // customer_longitude: selectedLocation.longitude,
    };

    try {
      const response = await createOrder(orderinfo);
      console.log("test one two three: ", response);

      await loadCartData();
      // Toast.show({
      //   type: "success",
      //   text1: "Order successful!",
      //   // visibilityTime: 2000,
      // });

      const { id, total, payment_status } = response;

      setOrderId(id);
      setTotalAmount(total);
      setPaymentStatus(payment_status);
      setAmountToPay(total);
      // console.log("this is before modal opened:", total);
      // Show modal
      // setShowModal(true);
      if (selectedOption === "directbanktransfer") {
        handleBankPayment({
          orderId: id,
          amountToPay: total,
          paymentStatus: payment_status,
        });
      } else {
        let orderId = id;
        route.push(
          `/(tabs)/collection/schedule?orderId=${encodeURIComponent(
            JSON.stringify(orderId)
          )}`
        );
        // handleBankPayment({
        //   orderId: id,
        //   amountToPay: total,
        //   paymentStatus: payment_status,
        // });
      }
    } catch (error) {
      console.error("Error creating order", error);
      if (error.response?.status === 401) {
        Toast.show({
          type: "error",
          text1: "Please you have to login first",
          // visibilityTime: 2000,
        });
        route.push("/(auth)/sign-in");
      }
      Toast.show({
        type: "error",
        text1: "An error occurred while creating the order. Please try again.",
        // visibilityTime: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // The map modal for custom location selection
  // const renderMapModal = () => (
  //   <Modal visible={mapVisible} animationType="slide">
  //     <View style={styles.mapContainer}>
  //       <Text style={styles.mapHeader}>Select Your Location</Text>
  //       {selectedLocation ? (
  //         <MapView
  //           style={styles.map}
  //           initialRegion={{
  //             latitude: selectedLocation.latitude,
  //             longitude: selectedLocation.longitude,
  //             latitudeDelta: 0.01,
  //             longitudeDelta: 0.01,
  //           }}
  //           onPress={(e) => {
  //             // When user taps on the map, update the marker location
  //             const { latitude, longitude } = e.nativeEvent.coordinate;
  //             setSelectedLocation({ latitude, longitude });
  //           }}
  //         >
  //           <Marker
  //             coordinate={selectedLocation}
  //             draggable
  //             onDragEnd={(e) => {
  //               const { latitude, longitude } = e.nativeEvent.coordinate;
  //               setSelectedLocation({ latitude, longitude });
  //             }}
  //           />
  //         </MapView>
  //       ) : (
  //         <Text>Loading map...</Text>
  //       )}
  //       {/* Confirm and Cancel buttons */}
  //       <TouchableOpacity
  //         style={styles.confirmButton}
  //         onPress={() => setMapVisible(false)}
  //       >
  //         <Text style={styles.confirmButtonText}>Confirm Location</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={styles.cancelButton}
  //         onPress={() => setMapVisible(false)}
  //       >
  //         <Text style={styles.cancelButtonText}>Cancel</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </Modal>
  // );

  return (
    <View style={styles.container}>
      {/* <Header /> */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => route.push("/(tabs)/cartscreen")}
          style={{ marginHorizontal: 10, paddingHorizontal: 2, borderWidth:1, borderRadius:52, paddingVertical:2 ,  borderColor:"#445399",}}
          className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
        >
          <Ionicons name="arrow-back" size={24} color="#445399" />
        </TouchableOpacity>
        {/* <View style={styles.iconWrapper}>
          <TouchableOpacity>
            <MaterialIcons name="favorite-border" size={28} color="#445399" />
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0</Text>
          </View>
        </View> */}
      <Text
        className="font-poppins-bold text-center text-primary mb-4"
        style={{
           fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: "#445399",
            marginTop:23,

            // position:"absolute",
            // top:12,
            // right:160
        }}
      >
        {t("check")}
      </Text>
      <View style={{paddingHorizontal:32}}></View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Summary Section */}
        <View style={styles.sectiona}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("phone")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("first")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("last")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("email")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {/* Location Choice Section */}

          {/* Location Choice Section */}
          {/* <View style={styles.locationSection}>
          <Text style={styles.label}>Select Delivery Location:</Text>
          <View style={styles.choiceContainer}>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                locationChoice === "current" && styles.selectedChoice,
              ]}
              onPress={() => {
                setLocationChoice("current");
                if (currentLocation) {
                  setSelectedLocation(currentLocation);
                  setShowMap(false);
                }
              }}
            >
              <Text>Use Current Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                locationChoice === "custom" && styles.selectedChoice,
              ]}
              onPress={() => {
                setLocationChoice("custom");
                setShowMap(true);
              }}
            >
              <Text>Select on Map</Text>
            </TouchableOpacity>
          </View>
          {selectedLocation && (
            <Text style={styles.locationText}>
              Selected: {selectedLocation.latitude.toFixed(4)},{" "}
              {selectedLocation.longitude.toFixed(4)}
            </Text>
          )}

          
          {showMap && locationChoice === "custom" && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: selectedLocation ? selectedLocation.latitude : 0,
                  longitude: selectedLocation ? selectedLocation.longitude : 0,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setSelectedLocation({ latitude, longitude });
                }}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    draggable
                    onDragEnd={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      setSelectedLocation({ latitude, longitude });
                    }}
                  />
                )}
              </MapView>
            </View>
          )}
        </View> */}
        </View>
        <Text
          className="font-poppins-bold text-center text-primary mb-4"
          style={styles.headerTitle}
        >
          {t("your")}
        </Text>
        <View style={styles.section}>
          <View
            style={{
              // display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              // marginHorizontal: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#445399",
              
            }}
          >
            <Text style={styles.sectionTitle}>{t("product")}</Text>
            <Text style={styles.sectionTitle}>{t("price")}</Text>
          </View>

          {cart.items.map((item) => (
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
                      ? item.item_name
                      : item.item_name_amh}
                  </Text>
                  <Text style={styles.quantity1}>
                    {parseInt(item.variations.quantity)}
                    {t(`${item.variations.unit}`)}
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

          <View style={styles.totalContainer}>
            {/* <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Items:</Text>
              <Text style={styles.totalValue}>{cart.total_items}</Text>
            </View> */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("total")}:</Text>
              <Text style={styles.grandTotal}>
                {i18n.language === "en" ? t("br") : ""}
                {cart.total.toFixed(2)}
                {i18n.language === "amh" ? t("br") : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 14,
            gap:6
          }}
        >
          {/* <View style={styles.paymentMethod}>
            <View style={styles.radioButton}>
              <View style={styles.radioSelected} />
            </View>
            <Text style={styles.paymentMethodText}>Direct Bank Transfer</Text>
          </View> */}
          {/* <View style={styles.paymentMethod}>
            <View style={styles.radioButton}>
              <View style={styles.radionotSelected} />
            </View>
            <Text style={styles.paymentMethodText}>Cash on Delivery</Text>
          </View> */}
          <TouchableOpacity
            style={styles.radioLabel}
            onPress={() => {
              // setAmountToPay(advanceAmount);
              setSelectedOption("directbanktransfer");
            }}
          >
            <View
              style={
                selectedOption === "directbanktransfer" && styles.radioButtons
              }
            >
              <View
                style={[
                  styles.radioButton,
                  selectedOption === "directbanktransfer" &&
                    styles.radioSelected,
                ]}
              />
            </View>
            <Text
              style={{
                marginRight: 4,
                fontSize: i18n.language === "en" ? 12 : 12,
              }}
            >
              {t("direct")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioLabel}
            onPress={() => {
              // setAmountToPay(advanceAmount);
              setSelectedOption("cashondelivery");
            }}
          >
            <View
              style={selectedOption === "cashondelivery" && styles.radioButtons}
            >
              <View
                style={[
                  styles.radioButton,
                  selectedOption === "cashondelivery" && styles.radioSelected,
                ]}
              />
            </View>
            <Text
              style={{
                fontSize: i18n.language === "en" ? 12 : 12,
                marginRight: 4,
              }}
            >
              {t("cash")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            isLoading && { opacity: 0.6 }, // Optional visual feedback
          ]}
          onPress={handlePlaceOrder}
          disabled={isLoading} // Prevent multiple taps
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={
                i18n.language === "en"
                  ? styles.placeOrderText
                  : styles.placeOrderText1
              }
            >
              {selectedOption === "cashondelivery" ? t("schedule") : t("pay")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            
            <Text style={styles.modalTitle}>Payment Option</Text>

           
            <View style={styles.radioContainer}>
             
              <TouchableOpacity
                style={styles.radioLabel}
                onPress={() => {
                  setAmountToPay(advanceAmount);
                  setSelectedOption("advance");
                }}
              >
                <View
                  style={selectedOption === "advance" && styles.radioButtons}
                >
                  <View
                    style={[
                      styles.radioButton,
                      selectedOption === "advance" && styles.radioSelected,
                    ]}
                  />
                </View>
                <Text style={styles.radioText}>
                  Pay Advance Br {advanceAmount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioLabel}
                onPress={() => {
                  setAmountToPay(totalAmount);
                  setSelectedOption("total");
                }}
              >
                <View style={selectedOption === "total" && styles.radioButtons}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedOption === "total" && styles.radioSelected,
                    ]}
                  />
                </View>
                <Text style={styles.radioText}>Pay Total Br {totalAmount}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedText}>
              selected :
              <Text style={styles.selectedAmount}>
                br
                {amountToPay || totalAmount}
              </Text>
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={choiceofpayment}
                style={styles.proceedButton}
              >
                <Text style={styles.proceedButtonText}>Proceed To pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    // height: 40,
    // backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    // marginBottom:20,
    paddingTop:0,
    // paddingBottom:3
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
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
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#445399",
    // position:"absolute",
    // top:-12
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingVertical: 6,
    paddingBottom: 100,
  },
  sectiona: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#445399",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: "#445399",
    marginLeft:12
  },
  input: {
    height: 40,
    // borderWidth: 1,
    // borderColor: "#445399",
    borderRadius: 38,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    paddingLeft: 15,
    // placeholderTextColor: "#445399",
  },
  section: {
    backgroundColor: "rgba(150, 166, 234, 0.4)",
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    width:62,
    color: "#333",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
    // backgroundColor: "red",
    // textAlign: "center",
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
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
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  grandTotal: {
    fontSize: 18,
    color: "#445399",
    fontWeight: "700",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioButtons: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "gray",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
    marginRight: 4,
  },
  // radioButton: {
  //   height: 20,
  //   width: 20,
  //   borderRadius: 10,
  //   borderWidth: 2,
  //   borderColor: "gray",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   marginLeft:4
  // },
  // radioSelected: {
  //   backgroundColor: "green", // Conditional green color
  //   borderColor: "green",
  // },
  radioLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  radioSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#445399",
  },
  paymentMethodText: {
    fontSize: 11,
    color: "#333",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
    textAlign: "center",
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
    width: "100%",
    textAlign: "center",
  },
  placeOrderText1: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    width: "100%",
    textAlign: "center",
  },
  //starts here
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", // bg-black bg-opacity-50
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff", // bg-white
    paddingHorizontal: 24, // px-6 ~ 24px
    paddingVertical: 16, // py-4 ~ 16px (use 24px for larger screens if needed)
    borderRadius: 8, // rounded-lg
    width: 330, // md:w-[500px] - adjust or use maxWidth
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 8, // roughly top-2 (8px)
    right: 8, // roughly right-2 (8px)
  },
  closeButtonText: {
    fontSize: 20, // text-xl
    fontWeight: "600", // font-semibold
    color: "#4B5563", // text-gray-600
  },
  modalTitle: {
    textAlign: "center", // text-center
    fontSize: 14, // text-[14px] (adjust for larger screens if needed)
    fontWeight: "600", // font-semibold
    marginBottom: 16, // mb-4 ~ 16px
  },
  radioContainer: {
    flexDirection: "column", // flex flex-col
    marginBottom: 16, // mb-4
  },
  radioLabel: {
    flexDirection: "row", // flex row
    alignItems: "center", // items-center
    marginBottom: 8, // mb-2
  },
  radioButton: {
    width: 20, // can adjust size as needed
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8, // mr-2
    justifyContent: "center",
    alignItems: "center",
  },
  radioText: {
    fontSize: 12, // text-[12px]
    color: "#4B5563", // text-gray-700
  },
  selectedText: {
    color: "#6B7280", // text-gray-500
    marginBottom: 16, // mb-4
    fontSize: 12, // text-[12px]
  },
  selectedAmount: {
    fontWeight: "bold", // font-bold
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // flex justify-end
  },
  proceedButton: {
    backgroundColor: "#A0522D", // bg-primary-lightbrown (replace with your specific color)
    paddingHorizontal: 16, // px-4 ~ 16px
    paddingVertical: 8, // py-2 ~ 8px
    borderRadius: 35, // rounded
    marginTop: 10,
  },
  proceedButtonText: {
    color: "#fff", // text-white
    textAlign: "center",
    fontSize: 12, // text-[12px]
  },
  locationSection: { marginVertical: 16 },
  // label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  choiceContainer: { flexDirection: "row", marginBottom: 8 },
  choiceButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 4,
  },
  selectedChoice: { backgroundColor: "#d0e8ff" },
  locationText: { marginTop: 8, fontSize: 14 },
  mapContainer: {
    width: 300,
    height: 250,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  map: { width: "100%", height: "100%" },
  confirmButton: {
    backgroundColor: "#445399",
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  confirmButtonText: { color: "#fff", fontSize: 16 },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  cancelButtonText: { color: "#445399", fontSize: 16 },
});

export default CheckoutPage;
