// import React, { useState, useEffect, useRef } from 'react';
// import { StyleSheet } from 'react-native';
// import { ref, onValue } from 'firebase/database';
// import { database } from '@/firebaseConfig';

// // set your public token
// // MapboxGL.setAccessToken('pk.eyJ1IjoiYW5kdWFsZW1hY3RpdmUiLCJhIjoiY205ZHdkMXJ0MGhlMTJpcXQ4bzgyYjFnZiJ9.Lhg5WUbonFe4mhCmEpSUKg');

// const OrderMapView = ({ order }) => {
//   const cameraRef = useRef(null);  // <-- ref for the Camera
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [deliveryLocation, setDeliveryLocation] = useState(null);

//   const customerLocation = [
//     Number(order.customer_longitude),
//     Number(order.customer_latitude),
//   ];

//   const deliveryPersonId = order.delivery_person?.user?.id;

//   useEffect(() => {
//     if (!deliveryPersonId) return;
//     const deliveryRef = ref(
//       database,
//       `locations/delivery_persons/${deliveryPersonId}`
//     );
//     const unsubscribe = onValue(deliveryRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         // const coord = [data.longitude, data.latitude];
//         // setDeliveryLocation(coord);
//         const longitude = Number(data.longitude);
//         const latitude = Number(data.latitude);
//         // Validate coordinates
//         if (!isNaN(longitude) && !isNaN(latitude)) {
//           setDeliveryLocation([longitude, latitude]);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, [deliveryPersonId]);

//     // only animate after the map has fully loaded
//     useEffect(() => {
//       if (mapLoaded && deliveryLocation && cameraRef.current) {
//         cameraRef.current.fitBounds(
//           customerLocation,
//           deliveryLocation,
//           50,   // padding
//           1000 // animation duration
//         );
//       }
//     }, [mapLoaded, deliveryLocation]);

//   return (
//     <Text>Hi</Text>
//     // <MapboxGL.MapView
//     //   style={styles.map}
//     //   styleURL={MapboxGL.StyleURL.Street}
//     //   onDidFinishLoadingMap={() => {
//     //            setMapLoaded(true);
//     //           }}
//     // >
//     //   <MapboxGL.Camera
//     //     ref={cameraRef}
//     //     centerCoordinate={customerLocation}
//     //     zoomLevel={12}
//     //   />

//     //   {/* Customer marker */}
//     //   <MapboxGL.PointAnnotation
//     //     id={`customer-${order.id}`}
//     //     coordinate={customerLocation}
//     //   />

//     //   {/* Delivery person & route */}
//     //   {deliveryLocation && (
//     //     <>
//     //       <MapboxGL.PointAnnotation
//     //          id={`delivery-${order.id}`}
//     //         coordinate={deliveryLocation}
//     //       />
//     //       <MapboxGL.ShapeSource
//     //          id={`route-${order.id}`}
//     //         shape={{
//     //           type: 'FeatureCollection',
//     //           features: [{
//     //             type: 'Feature',
//     //             geometry: {
//     //               type: 'LineString',
//     //               coordinates: [customerLocation, deliveryLocation],
//     //             },
//     //           }]
//     //         }}
//     //       >
//     //         <MapboxGL.LineLayer
//     //           id={`routeLine-${order.id}`}
//     //           style={{
//     //             lineWidth: 3,
//     //             lineColor: '#1E90FF',
//     //           }}
//     //         />
//     //       </MapboxGL.ShapeSource>
//     //     </>
//     //   )}
//     // </MapboxGL.MapView>
//   );
// };

// const styles = StyleSheet.create({
//   map: {
//     width: 300,
//     height: 150,
//     borderRadius: 4,
//   },
// });

// export default OrderMapView;
// OrderMapView.jsx
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
const {
  MapView,
  Camera,
  PointAnnotation,
  RasterSource,
  RasterLayer,
  SymbolLayer,
  ShapeSource,
  MarkerView,
} = MapLibreGL;

import { ref, onValue } from "firebase/database";
import { database } from "@/firebaseConfig";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Entypo from '@expo/vector-icons/Entypo';


export default function OrderTrackingMap({ order }) {
  const cameraRef = useRef(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  // customer coords as [lon, lat]
  const customerCoord = [
    Number(order.customer_longitude),
    Number(order.customer_latitude),
  ];

  // listen for live delivery updates
  useEffect(() => {
    if (!order?.id) return;
    const locRef = ref(database, `locations/orders/${order.id}`);
    const unsub = onValue(locRef, (snapshot) => {
      const data = snapshot.val();
      if (data && !isNaN(data.longitude) && !isNaN(data.latitude)) {
        const live = {
          longitude: Number(data.longitude),
          latitude: Number(data.latitude),
        };
        setDeliveryLocation(live);

        // once we have both, recenter to midpoint
        if (cameraRef.current) {
          const midLon = (customerCoord[0] + live.longitude) / 2;
          const midLat = (customerCoord[1] + live.latitude) / 2;
          cameraRef.current.setCamera({
            centerCoordinate: [midLon, midLat],
            zoomLevel: 13,
            animationDuration: 1000,
          });
        }
      }
    });
    return () => unsub();
  }, [order.id]);

  // build route only if deliveryLocation exists
  const routeCoords = deliveryLocation
    ? [customerCoord, [deliveryLocation.longitude, deliveryLocation.latitude]]
    : [];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
      >
        {/* 1) RasterSource → RasterLayer to pull in OSM tiles */}
        <RasterSource
          id="osmSource"
          tileUrlTemplates={[
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          ]}
          tileSize={256}
        >
          <RasterLayer id="osmLayer" />
        </RasterSource>

        {/* 2) Camera: start centered on customer */}
        <Camera
          ref={cameraRef}
          centerCoordinate={customerCoord}
          zoomLevel={12}
        />

        {/* 3) Customer pin: blue circle */}
        {/* <PointAnnotation id="customer" coordinate={customerCoord}>
          <View style={[styles.pin, { backgroundColor: "#007AFF" }]} />
        </PointAnnotation> */}
        <MarkerView coordinate={customerCoord}>
          <View style={[styles.pin, ]} >
            {/* <FontAwesome6 name="map-pin" size={28} color="#445399" /> */}
          <Entypo name="location-pin" size={28} color="#445399" />
          {/* <EvilIcons name="location" size={28} color="#445399" /> */}
          </View>
        </MarkerView>

        {/* 4) Delivery pin + route: red circle + blue line */}
        {deliveryLocation && (
          <>
            <MarkerView coordinate={deliveryCoord}>
              <View style={[styles.pin, { backgroundColor: "#FF3B30" }]} />
            </MarkerView>

            <MapLibreGL.ShapeSource
              id="route"
              shape={{
                type: "Feature",
                geometry: { type: "LineString", coordinates: routeCoords },
              }}
            >
              <MapLibreGL.LineLayer
                id="routeLine"
                style={{ lineColor: "#445399", lineWidth: 3 }}
              />
            </MapLibreGL.ShapeSource>
          </>
        )}
      </MapView>
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//     aspectRatio: 2,
//     // borderRadius: 8,
//     overflow: "hidden",
    
//   },
//   map: {
//     flex: 1,
//     height: 200,
//   },
//   pin: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     width: 40,
//     height: 40,
//     elevation: 10,
//     zIndex: 10,
//   },
// });
const styles = StyleSheet.create({
  container: {
    width: "100%",
    // Remove or comment out aspectRatio if you want fixed height
    // aspectRatio: 2,
    // borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    flex: 1,
    height: 400, // Increase this to your desired height
  },
  pin: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    elevation: 10,
    zIndex: 10,
  },
});
