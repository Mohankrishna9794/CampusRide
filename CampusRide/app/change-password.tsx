import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  EmailAuthProvider, reauthenticateWithCredential, updatePassword,
} from 'firebase/auth';
import { auth } from './firebase';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = async () => {
    setError('');
    if (!current || !next || !confirm) { setError('Please fill all fields'); return; }
    if (next.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (next !== confirm) { setError('New passwords do not match'); return; }

    const user = auth.currentUser;
    if (!user || !user.email) { setError('You are not logged in'); return; }

    setLoading(true);
    try {
      // Re-authenticate (Firebase requires a recent login to change the password)
      const cred = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, next);
      setDone(true);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else {
        setError('Could not update password. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/profile' as any)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Password Updated</Text>
          <Text style={styles.successSub}>Your password has been changed successfully.</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={() => router.replace('/profile' as any)}>
            <Text style={styles.submitBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/profile' as any)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input} placeholder="Enter current password"
                placeholderTextColor="#aaa" value={current} onChangeText={setCurrent}
                secureTextEntry={!show}
              />
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input} placeholder="Min 6 characters"
                placeholderTextColor="#aaa" value={next} onChangeText={setNext}
                secureTextEntry={!show}
              />
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input} placeholder="Re-enter new password"
                placeholderTextColor="#aaa" value={confirm} onChangeText={setConfirm}
                secureTextEntry={!show}
              />
              <TouchableOpacity onPress={() => setShow(!show)}>
                <Text style={styles.showBtn}>{show ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnLoading]}
              onPress={handleChange} disabled={loading}
            >
              <Text style={styles.submitBtnText}>{loading ? 'Updating...' : 'Update Password'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1A56DB', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  backText: { fontSize: 13, color: '#ffffff', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 18, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#0A0F2E', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E8EEFF',
    paddingHorizontal: 14, height: 52, marginBottom: 16,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#0A0F2E', fontWeight: '500' },
  showBtn: { fontSize: 13, color: '#1A56DB', fontWeight: '700' },
  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 14, fontWeight: '500' },
  submitBtn: { backgroundColor: '#1A56DB', borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 6 },
  submitBtnLoading: { backgroundColor: '#1A56DB99' },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successEmoji: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#0A0F2E', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
});
