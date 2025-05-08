// auth/new-password.jsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter, useSearchParams, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const baseUrl = 'https://yasonbackend.yasonsc.com/account/';

const NewPasswordScreen = () => {
  const router = useRouter();
  const { reset_token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${baseUrl}auth/reset-password/`, {
        reset_token,
        new_password: password,
      },{
        headers: {
            "Content-Type": "application/json",
        },
    });
      Alert.alert('Success', 'Password reset successfully.');
      router.push('/(auth)/sign-in'); // Navigate back to sign-in screen
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to reset password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set New Password</Text>
      <TextInput
        label="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        label="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleResetPassword}
        loading={loading}
        disabled={!password || loading}
      >
        Reset Password
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 15 },
});

export default NewPasswordScreen;