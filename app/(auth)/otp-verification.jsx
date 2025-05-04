// auth/otp-verification.jsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter, useSearchParams, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const baseUrl = 'https://yasonbackend.yasonsc.com/account/';

const OTPVerificationScreen = () => {
  const router = useRouter();
  const { emailOrPhone, channel } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}auth/verify-otp/`, {
        email_or_phone: emailOrPhone,
        code: otp,
      },{
        headers: {
            "Content-Type": "application/json",
        },
    });
      const { reset_token } = response.data;
      Alert.alert('Success', 'OTP verified.');
      router.push({
        pathname: '/(auth)/new-password',
        params: { reset_token },
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'OTP verification failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Enter the OTP sent to {emailOrPhone} via {channel}
      </Text>
      <TextInput
        label="OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleVerifyOTP}
        loading={loading}
        disabled={loading}
      >
        Verify OTP
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  instruction: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
  input: { marginBottom: 15 },
});

export default OTPVerificationScreen;
