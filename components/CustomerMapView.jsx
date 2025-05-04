import React, { useState, useEffect } from 'react';
import { GebetaMap, MapMarker, MapPolyline } from '@gebeta/tiles';
import { getDatabase, ref, onValue } from 'firebase/database';
import { database } from '@/firebaseConfig';

const CustomerMapView = ({ customerId, deliveryPersonId }) => {
  const [customerLocation, setCustomerLocation] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useEffect(() => {
    // Subscribe to customer's location updates
    const customerRef = ref(database, `locations/customers/${customerId}`);
    onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCustomerLocation([data.longitude, data.latitude]);
      }
    });

    // Subscribe to delivery person's location updates
    const deliveryRef = ref(database, `locations/delivery_persons/${deliveryPersonId}`);
    onValue(deliveryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeliveryLocation([data.longitude, data.latitude]);
      }
    });
  }, [customerId, deliveryPersonId]);

  // Determine map center - one simple approach is to center between the two points
  const mapCenter = customerLocation && deliveryLocation
    ? [(customerLocation[0] + deliveryLocation[0]) / 2, (customerLocation[1] + deliveryLocation[1]) / 2]
    : customerLocation || deliveryLocation || [0, 0];

  return (
    <GebetaMap
      apiKey="YOUR_GEBETA_API_KEY"
      center={mapCenter}
      zoom={12}
      style="gebeta_basic"
    >
      {customerLocation && (
        <MapMarker
          id="customer-marker"
          lngLat={customerLocation}
          color="#0000FF"
          onClick={() => console.log('Customer marker')}
        />
      )}
      {deliveryLocation && (
        <MapMarker
          id="delivery-marker"
          lngLat={deliveryLocation}
          color="#FF0000"
          onClick={() => console.log('Delivery marker')}
        />
      )}
      {(customerLocation && deliveryLocation) && (
        <MapPolyline
          id="route-line"
          coordinates={[customerLocation, deliveryLocation]}
          color="#00FF00"
        />
      )}
    </GebetaMap>
  );
};

export default CustomerMapView;
