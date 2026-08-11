import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const VerifyOtpScreen = ({ route, navigation }: any) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { verifyOtp } = useAuth();

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Invalid Code', 'Please enter your verification code');
      return;
    }
    try {
      setSubmitting(true);
      await verifyOtp(email, otp.trim());
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Verification code invalid or expired';
      Alert.alert('Verification Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          Enter the OTP code sent to <Text style={styles.boldEmail}>{email}</Text>
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.otpInput}
            placeholder="123456"
            placeholderTextColor="#64748b"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleVerify}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Verify & Complete</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
  },
  boldEmail: {
    color: '#2dd4bf',
    fontWeight: '700',
  },
  inputGroup: {
    marginVertical: 12,
  },
  otpInput: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 16,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '900',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#0d9488',
  },
  submitBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
