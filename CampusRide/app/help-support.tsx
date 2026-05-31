import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { submitSupportTicket, listenUserProfile, ADMIN_EMAIL, UserProfile } from '@/lib/rideService';
import { sendSupportEmail, isEmailConfigured } from '@/lib/email';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenUserProfile(currentUser.uid, setProfile);
    return () => unsub();
  }, [currentUser]);

  const handleSubmit = async () => {
    setError('');
    if (!subject.trim() || !message.trim()) { setError('Please fill in both fields'); return; }

    const name = profile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';
    const email = profile?.email || currentUser?.email || 'unknown';

    setLoading(true);
    try {
      // 1) Record the report in Firestore so the admin always has a permanent log
      await submitSupportTicket({
        uid: currentUser?.uid || 'guest',
        email, name, subject: subject.trim(), message: message.trim(),
      });

      // 2) Email the admin automatically via EmailJS — no mail client, no retyping.
      //    Only if EmailJS isn't configured do we fall back to the mail client.
      if (isEmailConfigured()) {
        await sendSupportEmail({
          from_name: name, from_email: email,
          subject: subject.trim(), message: message.trim(),
        });
      } else {
        const body = `From: ${name} (${email})\n\n${message.trim()}`;
        const mailto = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent('[CampusRide Support] ' + subject.trim())}&body=${encodeURIComponent(body)}`;
        Linking.openURL(mailto).catch(() => { /* no mail client — ticket is still saved */ });
      }

      setDone(true);
    } catch (e: any) {
      console.log('support error', e);
      setError(e?.message ? `Could not send: ${e.message}` : 'Could not send your report. Please try again');
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>📨</Text>
          <Text style={styles.successTitle}>Report Sent</Text>
          <Text style={styles.successSub}>
            Thanks! Your report was logged and emailed to our team. We&apos;ll get back to you soon.
          </Text>
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.intro}>
              Found a bug or need help? Tell us what&apos;s wrong and our team will reach out.
            </Text>

            <Text style={styles.label}>Subject</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>📝</Text>
              <TextInput
                style={styles.input} placeholder="e.g. Can't post a ride"
                placeholderTextColor="#aaa" value={subject} onChangeText={setSubject}
              />
            </View>

            <Text style={styles.label}>Describe the issue</Text>
            <View style={[styles.inputBox, styles.textArea]}>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholder="Tell us what happened..."
                placeholderTextColor="#aaa" value={message} onChangeText={setMessage}
                multiline
              />
            </View>

            {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnLoading]}
              onPress={handleSubmit} disabled={loading}
            >
              <Text style={styles.submitBtnText}>{loading ? 'Sending...' : 'Send Report'}</Text>
            </TouchableOpacity>

            <Text style={styles.contactNote}>📧 Or email us directly at {ADMIN_EMAIL}</Text>
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
  intro: { fontSize: 13, color: '#888', lineHeight: 19, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#0A0F2E', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E8EEFF',
    paddingHorizontal: 14, minHeight: 52, marginBottom: 16,
  },
  textArea: { alignItems: 'flex-start', paddingVertical: 10 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#0A0F2E', fontWeight: '500' },
  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 14, fontWeight: '500' },
  submitBtn: { backgroundColor: '#1A56DB', borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 6 },
  submitBtnLoading: { backgroundColor: '#1A56DB99' },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  contactNote: { fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 16 },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successEmoji: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#0A0F2E', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
});
