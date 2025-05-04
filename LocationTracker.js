// LocationTracker.js
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';
import { database } from '@/firebaseConfig'; // ensure you have your firebaseConfig.js file in your project
import { ref, set } from 'firebase/database';

const LocationTracker = ({ userId, role }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let subscription;

    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Subscribe to location updates
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // update every 2 seconds
          distanceInterval: 5, // update when moved 5 meters
        },
        (loc) => {
          setLocation(loc);
          // Determine the correct path based on role (delivery or customer)
          const path =
            role === 'delivery'
              ? `locations/delivery_persons/${userId}`
              : `locations/customers/${userId}`;

          // Write the updated location to Firebase
          set(ref(database, path), {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: Date.now(),
          })
            .then(() => console.log('Location updated successfully'))
            .catch((error) => console.error('Error updating location:', error));
        }
      );
    })();

    // Cleanup subscription when component unmounts
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {errorMsg ? (
        <Text>Error: {errorMsg}</Text>
      ) : location ? (
        <Text>
          Lat: {location.coords.latitude.toFixed(4)}, Lon:{' '}
          {location.coords.longitude.toFixed(4)}
        </Text>
      ) : (
        <Text>Waiting for location...</Text>
      )}
    </View>
  );
};

export default LocationTracker;
