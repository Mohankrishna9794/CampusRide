import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Animated,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');
  const [year, setYear] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid college email');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        name,
        email,
        phone,
        dept,
        year,
        vehicle: 'none',
        rating: 5.0,
        totalRides: 0,
        createdAt: new Date().toISOString(),
      });
      router.replace('/home' as any);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Registration failed. Please try again');
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
            onPress={() => router.replace('/login' as any)}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Create Account</Text>
          <Text style={styles.topSub}>Join CampusRide today</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personal Info</Text>

          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput style={styles.input} placeholder="Enter your full name"
              placeholderTextColor="#aaa" value={name} onChangeText={setName} />
          </View>

          <Text style={styles.label}>College Email *</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput style={styles.input} placeholder="yourname@college.edu"
              placeholderTextColor="#aaa" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput style={styles.input} placeholder="Enter your phone number"
              placeholderTextColor="#aaa" value={phone} onChangeText={setPhone}
              keyboardType="phone-pad" />
          </View>

          <Text style={styles.label}>Department</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>🎓</Text>
            <TextInput style={styles.input} placeholder="e.g. Computer Science"
              placeholderTextColor="#aaa" value={dept} onChangeText={setDept} />
          </View>

          <Text style={styles.label}>Year of Study</Text>
          <View style={styles.yearsRow}>
            {['1st', '2nd', '3rd', '4th'].map((y) => (
              <TouchableOpacity
                key={y}
                style={[styles.yearBtn, year === y && styles.yearBtnActive]}
                onPress={() => setYear(y)}
              >
                <Text style={[styles.yearText, year === y && styles.yearTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Security</Text>

          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput style={styles.input} placeholder="Min 6 characters"
              placeholderTextColor="#aaa" value={password} onChangeText={setPassword}
              secureTextEntry={!showPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={styles.showBtn}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput style={styles.input} placeholder="Re-enter your password"
              placeholderTextColor="#aaa" value={confirmPassword}
              onChangeText={setConfirmPassword} secureTextEntry={!showPass} />
          </View>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.registerBtnLoading]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerBtnText}>
                {loading ? 'Creating Account...' : 'Create Account 🚀'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => router.replace('/login' as any)}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Login</Text>
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
    width: '100%', height: 180, backgroundColor: '#1A56DB',
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28, paddingTop: 40, position: 'relative',
    shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
  },
  backBtn: {
    position: 'absolute', top: 52, left: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#ffffff20',
  },
  backText: { fontSize: 13, color: '#ffffff', fontWeight: '700' },
  topTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  topSub: { fontSize: 13, color: '#ffffff90', marginTop: 4 },
  form: { paddingHorizontal: 24, paddingBottom: 48 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0A0F2E', marginBottom: 16, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#0A0F2E', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FF', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    paddingHorizontal: 16, marginBottom: 18, height: 54,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0A0F2E', fontWeight: '500' },
  showBtn: { fontSize: 13, color: '#1A56DB', fontWeight: '700' },
  yearsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  yearBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    backgroundColor: '#F8F9FF', alignItems: 'center',
  },
  yearBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  yearText: { fontSize: 13, fontWeight: '700', color: '#888' },
  yearTextActive: { color: '#ffffff' },
  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 16, fontWeight: '500' },
  registerBtn: {
    backgroundColor: '#1A56DB', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', elevation: 12, marginBottom: 20,
    shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16,
  },
  registerBtnLoading: { backgroundColor: '#1A56DB99' },
  registerBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  loginRow: { alignItems: 'center', marginTop: 8 },
  loginText: { fontSize: 14, color: '#888', fontWeight: '500' },
  loginLink: { color: '#1A56DB', fontWeight: '800' },
});