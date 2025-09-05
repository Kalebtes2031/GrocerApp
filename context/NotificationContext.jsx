// context/NotificationContext.jsx

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useRef 
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import axios from "axios";
import { SAVEEXPOPUSHTOKEN } from "@/hooks/useFetch";

const NotificationContext = createContext(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    // Request permission + get token
    registerForPushNotificationsAsync().then(
      async (token) => {
        if (token) {
          setExpoPushToken(token);

          try {
            // 👇 Save token to your Django backend
            await SAVEEXPOPUSHTOKEN({ token });
            console.log("✅ Expo token saved:", token);
          } catch (err) {
            console.error("❌ Failed to save token:", err);
            setError(err);
          }
        }
      },
      (err) => setError(err)
    );

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("🔔 Notification Received: ", notification);
      setNotification(notification);
    });

    // Listen for user interaction with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(
        "🔔 Notification Response: ",
        JSON.stringify(response, null, 2),
        JSON.stringify(response.notification.request.content.data, null, 2)
      );
      // Handle custom navigation / deep linking here if needed
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
      {children}
    </NotificationContext.Provider>
  );
};
