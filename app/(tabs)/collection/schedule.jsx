import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Calendar } from "react-native-calendars";
// import { Button, Overlay, Icon } from "@rneui/themed";
// import DateTimePicker from "expo-date-time-picker";
import {
  fetchOrderDetail,
  scheduleDelivery,
  scheduleDeliveryAndPickFromStore,
} from "@/hooks/useFetch";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import * as Animatable from "react-native-animatable";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TimePickerModal } from "react-native-paper-dates";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import * as Location from "expo-location";
// import { GebetaMap, MapMarker } from "@gebeta/tiles";
import Toast from "react-native-toast-message";
import { useGlobalContext } from "@/context/GlobalProvider";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import MapView, { Marker } from "react-native-maps";

// import Mapbox from "@rnmapbox/maps";
// import MapboxGL from "@rnmapbox/maps"; // Import MapboxGL from '@rnmapbox/maps'; // Ensure you have the correct import for your version
import debounce from "lodash.debounce";

// MapboxGL.setAccessToken(
//   "pk.eyJ1IjoiYW5kdWFsZW1hY3RpdmUiLCJhIjoiY205ZHdkMXJ0MGhlMTJpcXQ4bzgyYjFnZiJ9.Lhg5WUbonFe4mhCmEpSUKg"
// );

const ScheduleDeliveryScreen = () => {
  const { t, i18n } = useTranslation("schedule");
  const { orderId } = useLocalSearchParams();
  const { user } = useGlobalContext();
  const navigation = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [text, setText] = useState("");
  const [product, setProduct] = useState({});
  const [selectedOption, setSelectedOption] = useState("needDelivery");
  const [currentLocation, setCurrentLocation] = useState(null);
  // selectedLocation: {latitude: number, longitude: number}
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationChoice, setLocationChoice] = useState("current");
  const [showMap, setShowMap] = useState(true);
  // const [text, setText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // const [selectedLocation, setSelectedLocation] = useState(null);
  // const [selectedAddress, setSelectedAddress] = useState("");

  // this ensures we never access null before location is set
  // const initialCoords = selectedLocation || currentLocation;

  // memoize & debounce so it’s stable across renders:
  // const debouncedFetch = useCallback(debounce(fetchPlaces, 300), []);

  const screenWidth = Dimensions.get("window").width;
  const responsiveWidth = (percentage) => screenWidth * (percentage / 100);

  // permission
 useEffect(() => {
    // fetchCustomerProfile();
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Location permission not granted",
          visibilityTime: 2000,
        });
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);
      // Set the default selected location to current location
      setSelectedLocation(coords);
    })();
  }, [user]);

  const fetchOrderData = async () => {
    const response = await fetchOrderDetail(orderId);
    setProduct(response);
    // console.log("orderId am:", orderId);
    console.log("detail info on order:", response);
  };
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    console.log("orderId am:", orderId);
    fetchOrderData();
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(new Date(date.timestamp));
    setCalendarOpen(false);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setSelectedDate(
        (prev) =>
          new Date(
            prev.setHours(selectedTime.getHours(), selectedTime.getMinutes())
          )
      );
    }
  };

  const validateDateTime = () => {
    const now = new Date();
    if (selectedDate <= now) {
      setError(t("please select future date & time"));
      return false;
    }
    return true;
  };

  const handleSchedule = async () => {
    if (!validateDateTime()) return;
    if (!selectedLocation) {
      Toast.show({
        type: "error",
        text1: "Please select your delivery location.",
        visibilityTime: 2000,
      });
      return;
    }
    // if (!initialCoords) {
    //   Toast.show({ type: "error", text1: t("select_location") });
    //   return;
    // }
    let customer_latitude = selectedLocation.latitude;
    let customer_longitude = selectedLocation.longitude;
    setLoading(true);
    try {
      await scheduleDelivery(
        orderId,
        selectedDate.toISOString(),
        customer_latitude,
        customer_longitude,
        // selectedAddress
      );
      navigation.push(
        `/(tabs)/orderinfo?orderId=${encodeURIComponent(
          JSON.stringify(orderId)
        )}`
      );
      // Show success toast here
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.detail });
      setError(err.response?.data?.detail || "Failed to schedule delivery");
    } finally {
      setLoading(false);
    }
  };
  const handleScheduleForPickFromStore = async () => {
    if (!validateDateTime()) return;

    setLoading(true);
    try {
      await scheduleDeliveryAndPickFromStore(
        orderId,
        selectedDate.toISOString()
      );
      navigation.push(
        `/(tabs)/orderinfo?orderId=${encodeURIComponent(
          JSON.stringify(orderId)
        )}`
      );
      // Show success toast here
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to schedule delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.back()}
          style={{ marginHorizontal: 10, paddingHorizontal: 2 }}
          className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
        >
          <Ionicons name="arrow-back" size={24} color="#445399" />
        </TouchableOpacity>
      </View>
      <Text
        // className="font-poppins-bold text-center text-primary mb-4"
        style={{
          fontSize: 20,
          fontWeight: "bold",
          fontFamily: "Poppins-bold",
          textAlign: "center",
          color: "#445399",
          marginBottom: 4,
        }}
      >
        {t("schedule")}
      </Text>
      <View style={{ padding: 12 }}>
        <Text
          style={{ fontSize: 18, paddingLeft: 8 }}
          className="text-start font-poppins-bold text-gray-800 text-[14px]"
        >
          {t("address")}
        </Text>
        {/* <View style={{ marginBottom: 10 }}>
          <TextInput
            style={{
              height: 50,
              width: "100%",
              borderColor: "gray",
              borderWidth: 1,
              paddingHorizontal: 15,
              marginBottom: 10,
              borderRadius: 39,
            }}
            placeholder={t("type")}
            value={text}
            onChangeText={(value) => {
              setText(value);
              setSelectedAddress(""); // clear any previous pick
              setSelectedLocation(null);
              debouncedFetch(value);
            }}
          />

          {searchResults.length > 0 && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 8,
                elevation: 3,
                maxHeight: 200,
              }}
            >
              {searchResults.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderColor: "#eee",
                  }}
                  onPress={() => {
                    setSelectedAddress(place.name);
                    setSelectedLocation(place.coords);
                    setText(place.name);
                    setSearchResults([]);
                  }}
                >
                  <Text>{place.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View> */}

        <TextInput
          style={{
            height: 50,
            width: "100%",
            borderColor: "gray",
            borderWidth: 1,
            paddingHorizontal: 15,
            marginBottom: 10,
            borderRadius: 39,
          }}
          placeholder={t("type")}
          onChangeText={(value) => setText(value)}
          value={text}
        />
      </View>
      {/* <View
        style={{
          padding: 10,
        }}
      >
        <Image source={require("@/assets/images/map.png")} />
      </View> */}

      {/* Location Choice Section */}
      {/* <View style={styles.locationSection}>
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
              if (!selectedLocation && currentLocation) {
                setSelectedLocation(currentLocation);
              }
            }}
          >
            <Text>Select on Map</Text>
          </TouchableOpacity>
        </View>

        {(locationChoice === "current" || locationChoice === "custom") &&
          currentLocation && (
            <View>
              <View style={styles.mapContainer}>
                <MapboxGL.MapView
                  style={styles.map}
                  onPress={(e) => {
                    const [longitude, latitude] = e.geometry.coordinates;
                    setSelectedLocation({ latitude, longitude });
                  }}
                  logoEnabled={false}
                  attributionEnabled={false}
                >
                  {initialCoords && (
                    <MapboxGL.Camera
                      centerCoordinate={[
                        initialCoords.longitude,
                        initialCoords.latitude,
                      ]}
                      zoomLevel={14}
                    />
                  )}
                  {initialCoords && (
                    <MapboxGL.PointAnnotation
                      id="picked"
                      coordinate={[
                        initialCoords.longitude,
                        initialCoords.latitude,
                      ]}
                    />
                  )}

                  
                </MapboxGL.MapView>
              </View>
            </View>
          )}
        {selectedLocation && (
          <View
            style={{
              padding: 10,
              backgroundColor: "#f0f0f0",
              borderRadius: 8,
              marginTop: 10,
            }}
          >

          <Text>
            selected Address : {selectedAddress}
          </Text>
            </View>
        )}
      </View> */}
      {/* react-native-maps */}
       {/* <View style={styles.locationSection}>
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
              // optionally preset to currentLocation:
              if (!selectedLocation && currentLocation) {
                setSelectedLocation(currentLocation);
              }
            }}
          >
            <Text>Select on Map</Text>
          </TouchableOpacity>
        </View>

        {(locationChoice === "current" || locationChoice === "custom") && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={
                selectedLocation && {
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              }
              onPress={
                locationChoice === "custom"
                  ? (e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      setSelectedLocation({ latitude, longitude });
                    }
                  : undefined
              }
              scrollEnabled={locationChoice === "custom"}
              zoomEnabled={locationChoice === "custom"}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  draggable={locationChoice === "custom"}
                  onDragEnd={
                    locationChoice === "custom"
                      ? (e) => {
                          const { latitude, longitude } =
                            e.nativeEvent.coordinate;
                          setSelectedLocation({ latitude, longitude });
                        }
                      : undefined
                  }
                />
              )}
            </MapView>
          </View>
        )}
      </View> */}
      <Text
        style={{ fontSize: 18, paddingLeft: 8, marginTop: 15 }}
        className="text-start font-poppins-bold text-gray-800 text-[14px] mb-4"
      >
        {t("date")}
      </Text>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {error ? (
          <Animatable.View
            animation="shake"
            duration={500}
            style={styles.errorContainer}
          >
            {/* 
          
            <Icon name="error-outline" color="#ff4444" />
          */}
            <Text style={styles.errorText}>{error}</Text>
          </Animatable.View>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: 4,
          }}
        >
          <View
            style={[
              styles.calendarContainer,
              // { width: 220, height: 220, overflow: 'hidden' },
            ]}
          >
            {calendarOpen && (
              <Calendar
                // only fix the overall width; height will adjust
                style={{ width: responsiveWidth(63), alignSelf: "center" }}
                // keep your existing props…
                minDate={format(new Date(), "yyyy-MM-dd")}
                onDayPress={handleDateSelect}
                markedDates={{
                  [format(selectedDate, "yyyy-MM-dd")]: { selected: true },
                }}
                // now the magic: shrink fonts & cell sizes
                theme={{
                  selectedDayBackgroundColor: "#445399",
                  todayTextColor: "#445399",
                  arrowColor: "#445399",
                  // smaller month header
                  textMonthFontSize: 16,
                  textMonthFontWeight: "600",
                  // smaller weekday names (Sun, Mon…)
                  textDayHeaderFontSize: 12,
                  // smaller day numbers
                  textDayFontSize: 10,

                  // shrink the arrows
                  arrowSize: 16,

                  // override the calendar’s internal styles:
                  "stylesheet.calendar.main": {
                    // tighten up each row
                    week: {
                      marginTop: 2,
                      marginBottom: 2,
                      flexDirection: "row",
                      justifyContent: "space-around",
                    },
                  },
                  "stylesheet.day.basic": {
                    // shrink each day cell
                    base: {
                      width: 28,
                      height: 28,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    text: {
                      marginTop: 0,
                      fontSize: 10,
                    },
                  },
                }}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.timePickerButton, { flexDirection: "column" }]}
            onPress={() => setShowTimePicker(true)}
          >
            <FontAwesome6 name="clock" size={24} color="#445399" />
            {/* <Icon name="clock" type="feather" color="#2089dc" /> */}
            <Text style={styles.timeText}>
              {format(selectedDate, "hh:mm a")}
            </Text>
          </TouchableOpacity>
        </View>
        {showTimePicker && (
          // <Overlay
          //   isVisible={showTimePicker}
          //   onBackdropPress={() => setShowTimePicker(false)}
          // >
          <View style={styles.timePickerContainer}>
            <TimePickerModal
              visible={showTimePicker}
              onDismiss={() => {
                setShowTimePicker(false);
                setCalendarOpen(true);
              }}
              onConfirm={({ hours, minutes }) => {
                const newDate = new Date(selectedDate);
                newDate.setHours(hours, minutes);
                setSelectedDate(newDate);
                console.log(newDate);
                setShowTimePicker(false);
                setCalendarOpen(true);
              }}
              hours={selectedDate.getHours()}
              minutes={selectedDate.getMinutes()}
            />
          </View>
        )}
        {/* confirm button */}
        <View
          style={{
            paddding: 50,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              marginBottom: 10,
              width: "100%",
              paddingHorizontal: 2,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonContainer,
                loading && { opacity: 0.6 },
              ]}
              onPress={handleSchedule}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                ) : (
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 10 }}
                  />
                )}
                <Text
                  style={{
                    color: "white",
                    fontSize: i18n.language === "amh" ? 12 : 16,
                  }}
                >
                  {loading ? t("scheduling") : t("confirm")}
                </Text>
              </View>
            </TouchableOpacity>
            {/* OR Divider and Pickup Button */}
            <View>
              {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 4,
              gap: 12,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            <Text style={{ color: "#6b7280", fontSize: 14, fontWeight: "500" }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
          </View> */}

              <TouchableOpacity
                style={[
                  styles.button1,
                  styles.buttonContainer1,
                  loading && { opacity: 0.6 },
                ]}
                onPress={handleScheduleForPickFromStore}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {loading ? (
                    <ActivityIndicator
                      color="#fff"
                      style={{ marginRight: 10 }}
                    />
                  ) : (
                    <MaterialIcons
                      name="store"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <Text
                    style={{
                      color: "white",
                      fontSize: i18n.language === "amh" ? 12 : 16,
                    }}
                  >
                    {loading ? t("scheduling") : t("pick")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* <View style={{ marginTop: 12 }}>
        <Button title="Show Date Picker" onPress={showDatePicker} />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </View> */}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    // flex: 1,
    backgroundColor: "#fff",
    padding: 5,
    // height:200,
  },
  locationSection: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
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
    width: 350,
    height: 150,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  map: { width: "100%", height: "100%" },
  title: {
    marginBottom: 8,
    color: "#2d4150",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#86939e",
    textAlign: "center",
    marginBottom: 30,
  },
  calendarContainer: {
    borderRadius: 15,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 25,
    elevation: 3,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
    marginRight: 3,
  },
  timeText: {
    fontSize: 18,
    marginLeft: 10,
    color: "#2d4150",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#445399",
    borderRadius: 48,
    padding: 15,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 50,
  },
  button1: {
    backgroundColor: "#55B051",
    borderRadius: 48,
    padding: 15,
  },
  buttonContainer1: {
    marginTop: 20,
    borderRadius: 50,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe9e9",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  errorText: {
    color: "#ff4444",
    marginLeft: 10,
    fontSize: 14,
  },
  timePickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
  },
  pickerItem: {
    fontSize: 20,
    color: "#2089dc",
  },
});

export default ScheduleDeliveryScreen;
