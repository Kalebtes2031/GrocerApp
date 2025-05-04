import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebaseConfig';

// set your public token
// MapboxGL.setAccessToken('pk.eyJ1IjoiYW5kdWFsZW1hY3RpdmUiLCJhIjoiY205ZHdkMXJ0MGhlMTJpcXQ4bzgyYjFnZiJ9.Lhg5WUbonFe4mhCmEpSUKg');

const OrderMapView = ({ order }) => {
  const cameraRef = useRef(null);  // <-- ref for the Camera
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const customerLocation = [
    Number(order.customer_longitude),
    Number(order.customer_latitude),
  ];

  const deliveryPersonId = order.delivery_person?.user?.id;

  useEffect(() => {
    if (!deliveryPersonId) return;
    const deliveryRef = ref(
      database,
      `locations/delivery_persons/${deliveryPersonId}`
    );
    const unsubscribe = onValue(deliveryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // const coord = [data.longitude, data.latitude];
        // setDeliveryLocation(coord);
        const longitude = Number(data.longitude);
        const latitude = Number(data.latitude);
        // Validate coordinates
        if (!isNaN(longitude) && !isNaN(latitude)) {
          setDeliveryLocation([longitude, latitude]);
        }
      }
    });
    return () => unsubscribe();
  }, [deliveryPersonId]);

    // only animate after the map has fully loaded
    useEffect(() => {
      if (mapLoaded && deliveryLocation && cameraRef.current) {
        cameraRef.current.fitBounds(
          customerLocation,
          deliveryLocation,
          50,   // padding
          1000 // animation duration
        );
      }
    }, [mapLoaded, deliveryLocation]);

  return (
    <Text>Hi</Text>
    // <MapboxGL.MapView
    //   style={styles.map}
    //   styleURL={MapboxGL.StyleURL.Street}
    //   onDidFinishLoadingMap={() => {
    //            setMapLoaded(true);
    //           }}
    // >
    //   <MapboxGL.Camera
    //     ref={cameraRef}
    //     centerCoordinate={customerLocation}
    //     zoomLevel={12}
    //   />

    //   {/* Customer marker */}
    //   <MapboxGL.PointAnnotation
    //     id={`customer-${order.id}`}
    //     coordinate={customerLocation}
    //   />

    //   {/* Delivery person & route */}
    //   {deliveryLocation && (
    //     <>
    //       <MapboxGL.PointAnnotation
    //          id={`delivery-${order.id}`}
    //         coordinate={deliveryLocation}
    //       />
    //       <MapboxGL.ShapeSource
    //          id={`route-${order.id}`}
    //         shape={{
    //           type: 'FeatureCollection',
    //           features: [{
    //             type: 'Feature',
    //             geometry: {
    //               type: 'LineString',
    //               coordinates: [customerLocation, deliveryLocation],
    //             },
    //           }]
    //         }}
    //       >
    //         <MapboxGL.LineLayer
    //           id={`routeLine-${order.id}`}
    //           style={{
    //             lineWidth: 3,
    //             lineColor: '#1E90FF',
    //           }}
    //         />
    //       </MapboxGL.ShapeSource>
    //     </>
    //   )}
    // </MapboxGL.MapView>
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