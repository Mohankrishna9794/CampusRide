import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const handleReset = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email'); return; }

    setLoading(true);
    try {
      // Firebase sends the password-reset link via its own email service — no EmailJS/SMTP needed.
      await sendPasswordResetEmail(auth, email.trim());
      setSentTo(email.trim());
    } catch (err: any) {
      // Anti-enumeration: we must NOT reveal whether an account exists, so
      // `auth/user-not-found` is treated as success. But we must NOT lie about
      // genuine delivery failures (no network / rate limited) — otherwise the
      // user waits forever for an email that was never sent.
      switch (err?.code) {
        case 'auth/invalid-email':
          setError('That email address looks invalid');
          break;
        case 'auth/missing-email':
          setError('Please enter your email');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Check your connection and try again');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please wait a few minutes and try again');
          break;
        default:
          // user-not-found (and any other non-actionable case) → show the sent
          // screen so we never leak which emails are registered.
          setSentTo(email.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <View style={styles.container}>
        <View style={styles.topWave}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login' as any)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoSmall}>
            <Text style={styles.logoTextTop}>Campus</Text>
            <Text style={styles.logoTextBottom}>Ride</Text>
          </View>
        </View>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>📬</Text>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successSub}>
            If an account exists for{'\n'}<Text style={{ fontWeight: '800', color: '#0A0F2E' }}>{sentTo}</Text>,
            {'\n'}we&apos;ve sent a link to reset your password.
          </Text>
          <Text style={styles.successHint}>
            Don&apos;t see it? Check your spam folder. The link expires in 1 hour.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/login' as any)}>
            <Text style={styles.primaryBtnText}>Back to Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSentTo(''); }}>
            <Text style={styles.resendText}>Use a different email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topWave}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login' as any)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoSmall}>
            <Text style={styles.logoTextTop}>Campus</Text>
            <Text style={styles.logoTextBottom}>Ride</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcome}>Forgot Password? 🔑</Text>
          <Text style={styles.sub}>
            Enter your account email and we&apos;ll send you a link to reset your password.
          </Text>

          <Text style={styles.label}>College Email</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@college.edu"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnLoading]}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginRow} onPress={() => router.replace('/login' as any)}>
            <Text style={styles.loginText}>
              Remembered it? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#ffffff' },
  topWave: {
    width: '100%', height: 220, backgroundColor: '#1A56DB',
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
    shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 12, position: 'relative',
  },
  backBtn: {
    position: 'absolute', top: 52, left: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#ffffff20',
  },
  backText: { fontSize: 13, color: '#ffffff', fontWeight: '700' },
  logoSmall: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff20', borderWidth: 2,
    borderColor: '#ffffff30', borderRadius: 24,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  logoTextTop: { fontSize: 16, color: '#ffffffcc', fontWeight: '500', letterSpacing: 1 },
  logoTextBottom: { fontSize: 32, color: '#ffffff', fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  form: { paddingHorizontal: 24, paddingBottom: 40 },
  welcome: { fontSize: 28, fontWeight: '900', color: '#0A0F2E', marginBottom: 6 },
  sub: { fontSize: 14, color: '#888', marginBottom: 32, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#0A0F2E', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FF', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    paddingHorizontal: 16, marginBottom: 20, height: 56,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0A0F2E', fontWeight: '500' },
  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 16, fontWeight: '500' },
  primaryBtn: {
    backgroundColor: '#1A56DB', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12, marginBottom: 24,
  },
  primaryBtnLoading: { backgroundColor: '#1A56DB99' },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  loginRow: { alignItems: 'center' },
  loginText: { fontSize: 14, color: '#888', fontWeight: '500' },
  loginLink: { color: '#1A56DB', fontWeight: '800' },
  successBox: { paddingHorizontal: 24, alignItems: 'center', paddingTop: 10 },
  successEmoji: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#0A0F2E', marginBottom: 12 },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  successHint: { fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 18, marginBottom: 28 },
  resendText: { fontSize: 13, color: '#1A56DB', fontWeight: '700', marginTop: 16 },
});
