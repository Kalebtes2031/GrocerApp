import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

const baseUrl = 'https://yasonbackend.yasonsc.com/account/';

export default function NewPasswordScreen() {
  const { t } = useTranslation('newpass');
  const router = useRouter();
  const { reset_token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      showToast('error', error.response?.data?.error || t('password_reset_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('title')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('new_password')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder={t('confirm_password')}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />
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
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 4
  },
  button: {
    backgroundColor: '#445399',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#44539980'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});