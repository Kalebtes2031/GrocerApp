import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

// const baseUrl = 'https://yasonbackend.yasonsc.com/account/';
const baseUrl = 'https://backendsupermarket.activetechet.com/account/';

export default function NewPasswordScreen() {
  const { t } = useTranslation('newpass');
  const router = useRouter();
  const { reset_token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = (type, message) => {
    Toast.show({ type, text1: message, position: 'top' });
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      showToast('error', t('password_mismatch'));
      return;
    }
     try {
    setLoading(true);
    await axios.post(
        `${baseUrl}auth/reset-password/`,
        { reset_token, new_password: password },
        { headers: { 'Content-Type': 'application/json' } }
      );
    showToast('success', t('password_reset_success'));
    router.push('/(auth)/sign-in');
  } catch (error) {
    // 1) Log the entire response to your console so you see *everything*:
    console.log('Reset-password error response:', error.response);

    // 2) Show a JSON‐stringified version in your toast:
    const details = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : t('password_reset_failed');
    showToast('error', details);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('title')}</Text>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('new_password')}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                !showPassword
                  ? require('@/assets/icons/eye-hide.png')
                  : require('@/assets/icons/eye.png')
              }
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('confirm_password')}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Image
              source={
                !showConfirmPassword
                  ? require('@/assets/icons/eye-hide.png')
                  : require('@/assets/icons/eye.png')
              }
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, (!password || loading) && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={!password || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('reset_button')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#445399' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#445399',
    borderRadius: 54,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
    color: '#000',
  },
  eyeIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },

  button: {
    backgroundColor: '#445399',
    paddingVertical: 12,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#44539980'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
