// In your screen file, e.g., DeliveryScreen.js
import React from 'react';
import { View } from 'react-native';
import LocationTracker from '@/LocationTracker';

const DeliveryScreen = () => {
  // Replace 'yourDeliveryUserId' with the actual delivery person ID from your authentication system
  return (
    <View style={{ flex: 1 }}>
        
      <LocationTracker userId="2" role="delivery" />
    </View>
  );
};

export default DeliveryScreen;
