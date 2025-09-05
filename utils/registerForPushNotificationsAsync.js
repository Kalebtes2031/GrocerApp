//utils/registerForPushNotificationsAsync.js

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: "assets/sounds/new-notification-voice.mp3" 
        });
    }

    if (Device.isDevice){
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed b/c of permission not granted to get push token for push notification!');
            return;
        }
        const projectId = 
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;
        if (!projectId) {
            alert('Failed to get projectId for push notification!');
            return;
        }
        try {
            const  pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log('Your expo push token: ', pushTokenString);
            return pushTokenString;
        } catch (error) {
            console.error('Failed to get expo push token: ', error);
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }
}