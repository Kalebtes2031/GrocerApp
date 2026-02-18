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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Calendar as GCalendar } from "react-native-calendars";
import { Calendar as ECalendar } from "react-native-ethiopian-calendar";
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import * as Location from "expo-location";
// import { GebetaMap, MapMarker } from "@gebeta/tiles";
import Toast from "react-native-toast-message";
import { useGlobalContext } from "@/context/GlobalProvider";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import { am as dfAm } from "date-fns/locale";
import { toEthiopian, toGregorian } from "ethiopian-date";

import MapLibreGL from "@maplibre/maplibre-react-native";
const {
  MapView,
  Camera,
  PointAnnotation,
  RasterSource,
  RasterLayer,
  MarkerView,
} = MapLibreGL;

// import MapView, { Marker } from "react-native-maps";

// import Mapbox from "@rnmapbox/maps";
// import MapboxGL from "@rnmapbox/maps"; // Import MapboxGL from '@rnmapbox/maps'; // Ensure you have the correct import for your version
import debounce from "lodash.debounce";

const ETHIOPIAN_MONTHS_AM = [
  "መስከረም",
  "ጥቅምት",
  "ህዳር",
  "ታህሳስ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ",
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [openCalendar, setOpenCalendar] = useState(false);

  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  // this ensures we never access null before location is set
  // const initialCoords = selectedLocation || currentLocation;

  // memoize & debounce so it’s stable across renders:
  // const debouncedFetch = useCallback(debounce(fetchPlaces, 300), []);

  // Bounding box for Addis Ababa: [minLon, minLat, maxLon, maxLat]
  const ADDIS_VIEWBOX = [38.46, 8.8, 39.02, 9.2];

  useEffect(() => {
    if (selectedLocation) {
      reverseGeocodeBoth(selectedLocation);
    }
  }, [selectedLocation]);
  // 1. Helper that fetches the “most specific” name given a lang priority
  const fetchPlaceName = async ({ latitude, longitude }, langPriority) => {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json` +
      `&lat=${latitude}&lon=${longitude}` +
      `&addressdetails=1` +
      `&accept-language=${langPriority}`,
      {
        headers: {
          "User-Agent": "Yason/1.0",
          Accept: "application/json",
        },
      }
    );
    const data = await resp.json();
    const addr = data.address || {};
    // choose the most granular field available:
    return (
      addr.neighbourhood ||
      addr.suburb ||
      addr.village ||
      addr.hamlet ||
      addr.town ||
      addr.road ||
      addr.city ||
      ""
    );
  };

  // 2. New reverseGeocodeBoth that runs both lookups in parallel
  const reverseGeocodeBoth = async ({ latitude, longitude }) => {
    try {
      const [enName, amName] = await Promise.all([
        fetchPlaceName({ latitude, longitude }, "en,am"),
        fetchPlaceName({ latitude, longitude }, "am,en"),
      ]);

      // Join them, skipping duplicates:
      let bilingual;
      if (enName && amName && enName !== amName) {
        bilingual = `${enName} / ${amName}`;
      } else {
        bilingual = enName || amName;
      }

      setSelectedAddress(bilingual);
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
      setSelectedAddress("");
    }
  };

  const addis = [38.7578, 8.9806];
  const cameraCenter = selectedLocation
    ? [selectedLocation.longitude, selectedLocation.latitude]
    : locationChoice === "current" && currentLocation
      ? [currentLocation.longitude, currentLocation.latitude]
      : addis;

  const screenWidth = Dimensions.get("window").width;
  const responsiveWidth = (percentage) => screenWidth * (percentage / 100);

  const handleMapPress = (e) => {
    const [longitude, latitude] = e.geometry.coordinates;
    setSelectedLocation({ latitude, longitude });
    // center the camera on the tapped point:
    cameraRef.current.setCamera({
      centerCoordinate: [longitude, latitude],
      zoomLevel: 14,
      animationDuration: 500,
    });
  };
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

  // fetch function (debounced if you like):
  //
  // 2. Improve your Nominatim fetch so it really returns JSON
  const fetchAddresses = async (q) => {
    if (q.length < 3) return setSearchResults([]);

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&limit=10` +
        `&accept-language=am,en` +
        `&viewbox=${ADDIS_VIEWBOX.join(",")}` +
        `&bounded=1` +
        `&q=${encodeURIComponent(q)}`,
        { headers: { "User-Agent": "Yason/1.0", Accept: "application/json" } }
      );
      const data = await resp.json();

      // dedupe by place_id
      const unique = [];
      const seen = new Set();
      data.forEach((place) => {
        if (!seen.has(place.place_id)) {
          seen.add(place.place_id);
          unique.push(place);
        }
      });

      setSearchResults(unique);
    } catch (err) {
      console.warn("Address fetch failed:", err);
      setSearchResults([]);
    }
  };

  // in a useEffect to watch query (or debounce manually):
  useEffect(() => {
    const timeout = setTimeout(() => fetchAddresses(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const mapRef = useRef(null);
  const cameraRef = useRef(null);

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

  // const handleDateSelect = (date) => {
  //   setSelectedDate(new Date(date.timestamp));
  //   setCalendarOpen(false);
  //   setShowTimePicker(true);
  // };

  const handleDateSelect = (day) => {
    console.log("handleDateSelect got:", day);

    let jsDate;

    if (i18n.language === "amh") {
      // ───── ECalendar returns:
      // { ethiopian: { date, month, year }, gregorian: { date, month, year } }
      if (!day || !day.gregorian || typeof day.gregorian.year !== "number") {
        return; // no valid GC block → bail
      }

      const gY = day.gregorian.year;
      const gM = day.gregorian.month;
      const gD = day.gregorian.date;
      jsDate = new Date(gY, gM - 1, gD, 0, 0, 0);
    } else {
      // ───── GCalendar returns either:
      //    • day.timestamp  (ms since epoch at midnight UTC of that GC date)
      //    • or { year, month, day } (all Gregorian)
      if (!day) return;
      jsDate = day.timestamp
        ? new Date(day.timestamp)
        : new Date(day.year, day.month - 1, day.day, 0, 0, 0);
    }

    setSelectedDate(jsDate);
    setOpenCalendar(false);
    setOpenTimePicker(true);
  };

  // ② Show the date header (EC if Amharic, GC otherwise):
  const renderDateHeader = () => {
    if (i18n.language === "amh") {
      const [ey, em, ed] = toEthiopian(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        selectedDate.getDate()
      );
      return `${ed} ${ETHIOPIAN_MONTHS_AM[em - 1]} ${ey}`;
    }
    return format(selectedDate, "PPPP", { locale: dfAm });
  };

  // ③ Only compare "date-only" so tomorrow always passes:
  const validateDateTime = () => {
    const now = new Date();
    const todayMid = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const chosenMid = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0
    );
    if (chosenMid < todayMid) {
      setError(t("please_select"));
      return false;
    }
    return true;
  };

  const handleSchedule = async () => {
    console.log("this is time now:", selectedDate);
    setError(""); // reset error state

    if (!validateDateTime()) return;
    if (!selectedLocation) {
      Toast.show({
        type: "error",
        text1: t("please_select_address"),
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
        selectedAddress
      );
      navigation.push(
        `/(tabs)/orderinfo?orderId=${encodeURIComponent(
          JSON.stringify(orderId)
        )}`
      );
      // Show success toast here
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.detail });
      console.log("Backend responded with:", err.response?.data);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.scheduled_delivery?.[0] ||
        err.response?.data?.customer_latitude?.[0] ||
        err.response?.data?.customer_longitude?.[0] ||
        t("failed_to_schedule")
      );
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
        {/* <TouchableOpacity
          onPress={() => navigation.back()}
           style={{ marginHorizontal: 10, paddingHorizontal: 2, borderWidth:1, borderRadius:52, paddingVertical:2 ,  borderColor:"#445399",}}
          className="border w-10 h-10 flex flex-row justify-center items-center py-1 rounded-full border-gray-300"
        >
          <Ionicons name="arrow-back" size={24} color="#445399" />
        </TouchableOpacity> */}
        <View></View>
        <Text
          // className="font-poppins-bold text-center text-primary mb-4"
          style={{
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
            color: "#445399",
            marginTop: 4,
          }}
        >
          {t("schedule")}
        </Text>
        <View style={{ paddingHorizontal: 22 }}></View>
      </View>
      <View>
        {/* <Text
          style={{
            fontSize: 18,
            paddingLeft: 8,
            fontFamily: "Poppins-semibold",
            color: "#445399",
          }}
          className="text-start font-poppins-bold text-gray-800 text-[14px]"
        >
          {t("address")}
        </Text> */}
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

        {/* <TextInput
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
        /> */}
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("search_address")}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchResults.length > 0 && (
          <TouchableWithoutFeedback onPress={() => setSearchResults([])}>
            <View style={styles.overlay} pointerEvents="box-only" />
          </TouchableWithoutFeedback>
        )}
        {searchResults.length > 0 && (
          <ScrollView
            nestedScrollEnabled
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          >
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                onPress={() => {
                  const lat = parseFloat(item.lat),
                    lon = parseFloat(item.lon);
                  setSelectedLocation({ latitude: lat, longitude: lon });
                  setSelectedAddress(item.display_name);
                  setSearchResults([]);
                  setSearchQuery(item.display_name);
                  cameraRef.current.setCamera({
                    centerCoordinate: [lon, lat],
                    zoomLevel: 14,
                    animationDuration: 500,
                  });
                }}
              >
                <Text style={styles.resultItem}>{item.display_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      {/* react-native-maps */}
      <View style={styles.locationSection}>
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
            <Text
              style={{
                color: locationChoice === "current" ? "white" : "#445399",
              }}
            >
              {t("use_current")}
            </Text>
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
            <Text
              style={{
                color: locationChoice !== "current" ? "white" : "#445399",
              }}
            >
              {t("selectonmap")}
            </Text>
          </TouchableOpacity>
        </View>
        {(locationChoice === "current" || locationChoice === "custom") && (
          // inside your render return, replacing the <MapView> block:
          <View style={styles.mapContainer}>
            <MapView
              styleURL="https://demotiles.maplibre.org/style.json"
              style={styles.map}
              ref={mapRef}
              onPress={locationChoice === "custom" ? handleMapPress : undefined}
            >
              <RasterSource
                id="osmSource"
                tileUrlTemplates={[
                  "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                ]}
                tileSize={256}
              >
                <RasterLayer id="osmLayer" />
              </RasterSource>

              <Camera
                ref={cameraRef}
                centerCoordinate={cameraCenter}
                zoomLevel={12}
              />

              {selectedLocation && (
                <MarkerView
                  coordinate={[
                    selectedLocation.longitude,
                    selectedLocation.latitude,
                  ]}
                  anchor={{ x: 0.5, y: 1 }}
                >
                  <View style={[styles.pin, { backgroundColor: "#445399" }]}>
                    <Entypo name="location-pin" size={28} color="#fff" />
                  </View>
                </MarkerView>
              )}
            </MapView>
          </View>
        )}
      </View>
      {selectedAddress && (
        <Text style={styles.selectedAddress}>
          {t("selected_address")}: {selectedAddress || t("no_address_selected")}
        </Text>
      )}

      <Text
        style={{
          fontSize: 18,
          paddingLeft: 8,
          marginTop: 5,
          textAlign: "center",
          color: "#445399",
          fontSize: 14,
          fontWeight: "bold",
        }}
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
            alignItems: "start",
            // gap: 12,
            padding: 4,
          }}
        >
          <View
            style={[
              styles.calendarContainer,
              // { width: 220, height: 220, overflow: 'hidden' },
            ]}
          >
            <View style={[styles.wrapper, { width: responsiveWidth(63) }]}>
              {/* <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={styles.headerText}>{formatHeaderDate(selectedDate)}</Text>
        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="#445399"
        />
      </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() => setOpenCalendar((v) => !v)}
                style={styles.header}
                activeOpacity={0.7}
              >
                <Text style={{
                  fontSize: 16,
                  color: "#333",
                }}>
                  {renderDateHeader()}
                </Text>
                <MaterialIcons
                  name={
                    openCalendar ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  size={24}
                  color="#445399"
                />
              </TouchableOpacity>
              {openCalendar && (
                <View style={styles.calendarBox}>
                  {i18n.language === "amh" ? (
                    <ECalendar
                      mode="EC"
                      locale="AMH"
                      initialDate={selectedDate}
                      onDatePress={handleDateSelect}
                      hideHeaderButtons={true}
                      theme={{
                        selectedDayBackgroundColor: "#445399",
                        selectedDayTextColor: "#ffffff",
                        todayTextColor: "#445399",
                        arrowColor: "#445399",
                        textMonthFontSize: 12,
                        textMonthFontWeight: "600",
                        textDayHeaderFontSize: 12,
                        textDayFontSize: 10,
                        arrowSize: 12,
                        "stylesheet.calendar.main": {
                          week: {
                            height: 22,
                            marginTop: 2,
                            marginBottom: 2,
                            flexDirection: "row",
                            justifyContent: "space-around",
                          },
                        },
                        "stylesheet.day.basic": {
                          base: {
                            width: 24,
                            height: 18,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                          text: { marginTop: 0, fontSize: 10 },
                        },
                      }}
                    />
                  ) : (
                    <GCalendar
                      style={{ width: responsiveWidth(63) }}
                      minDate={format(new Date(), "yyyy-MM-dd")}
                      onDayPress={handleDateSelect}
                      markedDates={{
                        [format(selectedDate, "yyyy-MM-dd")]: {
                          selected: true,
                        },
                      }}
                      theme={{
                        selectedDayBackgroundColor: "#445399",
                        todayTextColor: "#445399",
                        arrowColor: "#445399",
                        textMonthFontSize: 16,
                        textMonthFontWeight: "600",
                        textDayHeaderFontSize: 12,
                        textDayFontSize: 10,
                        arrowSize: 16,
                        "stylesheet.calendar.main": {
                          week: {
                            marginTop: 2,
                            marginBottom: 2,
                            flexDirection: "row",
                            justifyContent: "space-around",
                          },
                        },
                        "stylesheet.day.basic": {
                          base: {
                            width: 28,
                            height: 28,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                          text: { marginTop: 0, fontSize: 10 },
                        },
                      }}
                    />
                  )}
                </View>
              )}
            </View>
          </View>

          {/* <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              // paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: "#fff",
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#ddd",
              marginBottom: 8,
            }}
            activeOpacity={0.7}
            onPress={() => setShowTimePicker((o) => !o)}
          >
            <Text style={styles.headerText}>
              {format(selectedDate, "hh:mm a")}
            </Text>
            <MaterialIcons
              name={
                showTimePicker ? "keyboard-arrow-up" : "keyboard-arrow-down"
              }
              size={24}
              color="#445399"
            />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => setOpenTimePicker((v) => !v)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              // paddingVertical: 6,
              paddingHorizontal: 1,
              backgroundColor: "#fff",
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#fff",
              marginBottom: 8,
              height: 50,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 12,
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.headerText}>
              {format(selectedDate, "hh:mm a")}
            </Text>
            <MaterialIcons
              name={
                openTimePicker ? "keyboard-arrow-up" : "keyboard-arrow-down"
              }
              size={24}
              color="#445399"
            />
          </TouchableOpacity>

          <TimePickerModal
            visible={openTimePicker}
            onDismiss={() => setOpenTimePicker(false)}
            onConfirm={({ hours, minutes }) => {
              const d = new Date(selectedDate);
              d.setHours(hours, minutes, 0);
              setSelectedDate(d);
              setOpenTimePicker(false);
            }}
            hours={selectedDate.getHours()}
            minutes={selectedDate.getMinutes()}
          />

          {/* ───── Error if any ───── */}
          {error !== "" && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
        {/* {showTimePicker && (
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
        )} */}
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
              paddingHorizontal: 12,
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
                  // <MaterialIcons
                  //   name="check-circle"
                  //   size={20}
                  //   color="#fff"
                  //   style={{ marginRight: 10 }}
                  // />
                  <MaterialCommunityIcons name="truck-delivery" size={20} color="#fff" style={{ marginRight: 10 }} />
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
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  wrapper: {
    alignSelf: "center",
    // marginTop: 20,
    // width: CAL_WIDTH,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
  },
  headerText: {
    fontSize: 16,
    color: "#333",
    // textAlign:"center",
  },
  calendarBox: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    overflow: "hidden",
    alignItems: "center",
  },
  dropdownWrapper: {
    // width: responsiveWidth(63),
    alignSelf: "center",
    marginVertical: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "red"
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: "#333",
  },
  headerContainer: {
    height: 40,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 0,
    marginBottom: 6,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  markerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    elevation: 10,
    zIndex: 10,
  },
  selectedAddress: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 8,
    backgroundColor: "#cce5ff",
    padding: 6,
    marginHorizontal: 24,
    borderRadius: 54,
    color: "#445399",
  },

  redPin: {
    width: 24,
    height: 24,
    backgroundColor: "red",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },

  overlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1,
    // pointerEvents: 'auto'  ← default, catches taps
  },
  resultsList: {
    position: "absolute",
    top: 40,
    left: 12,
    right: 12,
    maxHeight: 150,
    backgroundColor: "#fff",
    borderColor: "#445399",
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 4,
    zIndex: 2, // sit above the overlay
  },

  searchContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    height: 40,
    borderColor: "#445399",
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 24,
    backgroundColor: "#fff",
    paddingLeft: 12,
  },
  // resultsList: {
  //   maxHeight: 150,
  //   backgroundColor: "#fff",
  //   borderColor: "#445399",
  //   borderWidth: 1,
  //   borderTopWidth: 0,
  //   borderRadius: 4,
  // },
  resultItem: {
    padding: 8,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

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
  locationSection: { marginBottom: 4 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  choiceContainer: { flexDirection: "row", marginBottom: 8 },
  choiceButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 54,
  },
  selectedChoice: { backgroundColor: "#445399", color: "white" },
  locationText: { marginTop: 8, fontSize: 14 },
  mapContainer: {
    width: 350,
    height: 340,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 2,
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
    marginBottom: 15,
    elevation: 3,
    backgroundColor: "white",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    backgroundColor: "white",
    borderRadius: 10,
    // marginVertical: 10,
    elevation: 2,
    marginRight: 3,
    height: 243,
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
    // marginTop: 20,
    borderRadius: 50,
  },
  button1: {
    backgroundColor: "#55B051",
    borderRadius: 48,
    padding: 15,
  },
  buttonContainer1: {
    // marginTop: 20,
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
