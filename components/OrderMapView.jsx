
// secondone
// import React, { useState, useEffect, useRef } from "react";
// import { StyleSheet, View } from "react-native";
// import MapLibreGL from "@maplibre/maplibre-react-native";
// const {
//   MapView,
//   Camera,
//   PointAnnotation,
//   RasterSource,
//   RasterLayer,
//   SymbolLayer,
//   ShapeSource,
//   MarkerView,
// } = MapLibreGL;

// import { ref, onValue } from "firebase/database";
// import { database } from "@/firebaseConfig";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import EvilIcons from '@expo/vector-icons/EvilIcons';
// import Entypo from '@expo/vector-icons/Entypo';


// export default function OrderTrackingMap({ order }) {
//   const cameraRef = useRef(null);
//   const [deliveryLocation, setDeliveryLocation] = useState(null);

//   // customer coords as [lon, lat]
//   const customerCoord = [
//     Number(order.customer_longitude),
//     Number(order.customer_latitude),
//   ];

//   // listen for live delivery updates
//   useEffect(() => {
//     if (!order?.id) return;
//     const locRef = ref(database, `locations/orders/${order.id}`);
//     const unsub = onValue(locRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data && !isNaN(data.longitude) && !isNaN(data.latitude)) {
//         const live = {
//           longitude: Number(data.longitude),
//           latitude: Number(data.latitude),
//         };
//         setDeliveryLocation(live);

//         // once we have both, recenter to midpoint
//         if (cameraRef.current) {
//           const midLon = (customerCoord[0] + live.longitude) / 2;
//           const midLat = (customerCoord[1] + live.latitude) / 2;
//           cameraRef.current.setCamera({
//             centerCoordinate: [midLon, midLat],
//             zoomLevel: 13,
//             animationDuration: 1000,
//           });
//         }
//       }
//     });
//     return () => unsub();
//   }, [order.id]);

//   // build route only if deliveryLocation exists
//   const routeCoords = deliveryLocation
//     ? [customerCoord, [deliveryLocation.longitude, deliveryLocation.latitude]]
//     : [];

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         styleURL="https://demotiles.maplibre.org/style.json"
//       >
//         {/* 1) RasterSource → RasterLayer to pull in OSM tiles */}
//         <RasterSource
//           id="osmSource"
//           tileUrlTemplates={[
//             "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
//           ]}
//           tileSize={256}
//         >
//           <RasterLayer id="osmLayer" />
//         </RasterSource>

//         {/* 2) Camera: start centered on customer */}
//         <Camera
//           ref={cameraRef}
//           centerCoordinate={customerCoord}
//           zoomLevel={12}
//         />

//         {/* 3) Customer pin: blue circle */}
//         {/* <PointAnnotation id="customer" coordinate={customerCoord}>
//           <View style={[styles.pin, { backgroundColor: "#007AFF" }]} />
//         </PointAnnotation> */}
//         <MarkerView coordinate={customerCoord}>
//           <View style={[styles.pin, ]} >
//             {/* <FontAwesome6 name="map-pin" size={28} color="#445399" /> */}
//           <Entypo name="location-pin" size={28} color="#445399" />
//           {/* <EvilIcons name="location" size={28} color="#445399" /> */}
//           </View>
//         </MarkerView>

//         {/* 4) Delivery pin + route: red circle + blue line */}
//         {deliveryLocation && (
//           <>
//             <MarkerView coordinate={deliveryCoord}>
//               <View style={[styles.pin, { backgroundColor: "#FF3B30" }]} />
//             </MarkerView>

//             <MapLibreGL.ShapeSource
//               id="route"
//               shape={{
//                 type: "Feature",
//                 geometry: { type: "LineString", coordinates: routeCoords },
//               }}
//             >
//               <MapLibreGL.LineLayer
//                 id="routeLine"
//                 style={{ lineColor: "#445399", lineWidth: 3 }}
//               />
//             </MapLibreGL.ShapeSource>
//           </>
//         )}
//       </MapView>
//     </View>
//   );
// }

// // const styles = StyleSheet.create({
// //   container: {
// //     width: "100%",
// //     aspectRatio: 2,
// //     // borderRadius: 8,
// //     overflow: "hidden",
    
// //   },
// //   map: {
// //     flex: 1,
// //     height: 200,
// //   },
// //   pin: {
// //     display: "flex",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     width: 40,
// //     height: 40,
// //     elevation: 10,
// //     zIndex: 10,
// //   },
// // });
// const styles = StyleSheet.create({
//   container: {
//     width: "100%",
//     // Remove or comment out aspectRatio if you want fixed height
//     // aspectRatio: 2,
//     // borderRadius: 8,
//     overflow: "hidden",
//   },
//   map: {
//     flex: 1,
//     height: 400, // Increase this to your desired height
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
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
const { MapView, Camera, RasterSource, RasterLayer, ShapeSource, LineLayer, MarkerView } = MapLibreGL;
import { ref, onValue } from "firebase/database";
import { database } from "@/firebaseConfig";
import Entypo from "@expo/vector-icons/Entypo";


async function fetchRoadRoute(start, end) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start[0]},${start[1]};${end[0]},${end[1]}` +
    `?overview=full&geometries=geojson`;
  const resp = await fetch(url);
  const json = await resp.json();
  if (json.code === "Ok" && json.routes.length) {
    return json.routes[0].geometry.coordinates; // array of [lon, lat]
  }
  return [start, end]; // fallback straight line
} 
export default function OrderTrackingMap({ order }) {
  const cameraRef = useRef(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  // customer coords as [lon, lat]
  const customerCoord = [
    Number(order.customer_longitude),
    Number(order.customer_latitude),
  ];

  useEffect(() => {
  if (!order?.id) return;

  const locRef = ref(database, `locations/orders/${order.id}`);
  const unsub = onValue(locRef, async (snapshot) => {
    const data = snapshot.val();
    if (data?.latitude != null && data?.longitude != null) {
      const live = {
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      };
      setDeliveryLocation(live);

      // calculate route
      const start = customerCoord;
      const end = [live.longitude, live.latitude];
      const road = await fetchRoadRoute(start, end);
      setRouteCoords(road);

      // calculate & expand bounds
      let lons = [start[0], end[0]];
      let lats = [start[1], end[1]];
      let ne = [Math.max(...lons), Math.max(...lats)];
      let sw = [Math.min(...lons), Math.min(...lats)];
      const MIN_DELTA = 0.0005;
      if (Math.abs(ne[0] - sw[0]) < MIN_DELTA) {
        ne[0] += MIN_DELTA;
        sw[0] -= MIN_DELTA;
      }
      if (Math.abs(ne[1] - sw[1]) < MIN_DELTA) {
        ne[1] += MIN_DELTA; 
        sw[1] -= MIN_DELTA;
      }

      // fit both points in view
      cameraRef.current?.fitBounds(ne, sw, 50, 1000);
    }
  });  

  return () => unsub();
}, [order.id]); 


  // determine line coordinates
  const lineCoordinates = routeCoords.length
    ? routeCoords
    : deliveryLocation
    ? [customerCoord, [deliveryLocation.longitude, deliveryLocation.latitude]]
    : [];


  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL="https://demotiles.maplibre.org/style.json">
        <RasterSource
          id="osmSource"
          tileUrlTemplates={["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"]}
          tileSize={256}
        >
          <RasterLayer id="osmLayer" />
        </RasterSource>

        {/* center initially on customer */}
        <Camera
          ref={cameraRef}
          {...(!deliveryLocation
            ? { centerCoordinate: customerCoord, zoomLevel: 11 }
            : {})}
        />

        {/* Customer pin */}
        <MarkerView coordinate={customerCoord}>
          <View style={[styles.pin, { backgroundColor: "#445399" }]}>
            <Entypo name="location-pin" size={28} color="#fff" />
          </View>
        </MarkerView>

        {/* Delivery pin + route */}
        {deliveryLocation && (
          <>
            <MarkerView coordinate={[deliveryLocation.longitude, deliveryLocation.latitude]}>
              <View style={[styles.pin, { backgroundColor: "#FF3B30" }]} >
                <Entypo name="location-pin" size={28} color="#fff" />
          </View>
            </MarkerView>

            <ShapeSource
              id="route"
              shape={{
                type: "Feature",
                geometry: { type: "LineString", coordinates: lineCoordinates },
              }}
            >
              <LineLayer id="routeLine" style={{ lineColor: "#445399", lineWidth: 3 }} />
            </ShapeSource>
          </>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 430, overflow: "hidden" },
  map: { flex: 1 },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
