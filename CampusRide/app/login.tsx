import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Dimensions, Animated,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid college email');
      return;
    }
    setError('');
    setLoading(true);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home' as any);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topWave}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/onboarding' as any)}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoSmall}>
            <Text style={styles.logoTextTop}>Campus</Text>
            <Text style={styles.logoTextBottom}>Ride</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcome}>Welcome Back 👋</Text>
          <Text style={styles.sub}>Login to your CampusRide account</Text>

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

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.showBtn}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => router.push('/forgot-password' as any)}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnLoading]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginBtnText}>
                {loading ? 'Logging in...' : 'Login →'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.registerRow}
            onPress={() => router.push('/register' as any)}
          >
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerLink}>Register Now</Text>
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
  sub: { fontSize: 14, color: '#888', marginBottom: 32 },
  label: { fontSize: 13, fontWeight: '700', color: '#0A0F2E', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FF', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    paddingHorizontal: 16, marginBottom: 20, height: 56,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0A0F2E', fontWeight: '500' },
  showBtn: { fontSize: 13, color: '#1A56DB', fontWeight: '700' },
  forgotRow: { alignItems: 'flex-end', marginTop: -10, marginBottom: 24 },
  forgotText: { fontSize: 13, color: '#1A56DB', fontWeight: '600' },
  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 16, fontWeight: '500' },
  loginBtn: {
    backgroundColor: '#1A56DB', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12, marginBottom: 24,
  },
  loginBtnLoading: { backgroundColor: '#1A56DB99' },
  loginBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8EEFF' },
  dividerText: { fontSize: 12, color: '#aaa', fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#E8EEFF', borderRadius: 16,
    paddingVertical: 16, marginBottom: 28, gap: 10, backgroundColor: '#F8F9FF',
  },
  googleIcon: { fontSize: 20 },
  googleText: { fontSize: 15, fontWeight: '700', color: '#0A0F2E' },
  registerRow: { alignItems: 'center' },
  registerText: { fontSize: 14, color: '#888', fontWeight: '500' },
  registerLink: { color: '#1A56DB', fontWeight: '800' },
});