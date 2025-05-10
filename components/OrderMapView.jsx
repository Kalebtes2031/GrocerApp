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
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebaseConfig";

const OrderMapView = ({ order }) => {
  const mapRef = useRef(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  // Get customer location from the order (assuming they are saved as strings/ numbers).
  const customerLocation = {
    latitude: Number(order.customer_latitude),
    longitude: Number(order.customer_longitude),
  };

  // Extract the delivery person's Firebase identifier.
  // Adjust this according to how your order payload sends this info.
  const deliveryPersonId = order.delivery_person?.user?.id;

  useEffect(() => {
    if (!deliveryPersonId) return;
    // const deliveryRef = ref(
    //   database,
    //   `locations/delivery_persons/${deliveryPersonId}`
    // );
    const deliveryRef = ref(database,
      `locations/order_/${order.id}`
    )
    const unsubscribe = onValue(deliveryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const liveLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setDeliveryLocation(liveLocation);
        if (mapRef.current) {
          // Calculate a region centered between customer and delivery locations.
          const newRegion = {
            latitude: (customerLocation.latitude + liveLocation.latitude) / 2,
            longitude:
              (customerLocation.longitude + liveLocation.longitude) / 2,
            latitudeDelta: Math.max(
              Math.abs(customerLocation.latitude - liveLocation.latitude) * 2.5,
              0.05
            ),
            longitudeDelta: Math.max(
              Math.abs(customerLocation.longitude - liveLocation.longitude) *
                2.5,
              0.05
            ),
          };
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    });
    return () => unsubscribe();
  }, [deliveryPersonId, customerLocation]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      // provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {/* Customer's Static Location Marker */}
      <Marker
        coordinate={customerLocation}
        title={"Your Location"}
        // description="Your Location"
        pinColor="blue"
        // image={{uri:order?.items[0]?.product?.image}}
        // style={{width:100,height:100}}
      />

      {/* Live Delivery Person Marker */}
      {deliveryLocation && (
        <>
          <Marker
            coordinate={deliveryLocation}
            title={"Delivery Person"}
            pinColor="red"
          />
          {/* Draw a polyline between the two locations */}
          <Polyline
            coordinates={[customerLocation, deliveryLocation]}
            strokeColor="#1E90FF"
            strokeWidth={3}
          />
        </>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: 300,
    height: 150,
    borderRadius: 4,
  },
});

export default OrderMapView;
