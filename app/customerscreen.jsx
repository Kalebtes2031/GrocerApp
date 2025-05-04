import React from 'react';
import { View } from 'react-native';
import LocationTracker from '@/LocationTracker';

const CustomerScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Pass the customer's user ID and role */}
      <LocationTracker userId="1" role="customer" />
    </View>
  );
};

export default CustomerScreen;
