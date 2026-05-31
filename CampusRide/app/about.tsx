import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ADMIN_EMAIL } from '@/lib/rideService';

export default function AboutScreen() {
  const router = useRouter();

  const features = [
    { icon: '🔍', title: 'Find Rides', desc: 'Search rides from students heading to campus.' },
    { icon: '➕', title: 'Host Rides', desc: 'Offer your empty seats and split fuel costs.' },
    { icon: '🤝', title: 'Request & Accept', desc: 'Send a request; the host approves before you connect.' },
    { icon: '💬', title: 'Chat Safely', desc: 'Message only after a request is accepted.' },
    { icon: '🌿', title: 'Go Green', desc: 'Fewer vehicles, less CO₂ — carpool the campus way.' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/profile' as any)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.logoBox}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>CR</Text>
          </View>
          <Text style={styles.appName}>Campus<Text style={{ color: '#4A90E2' }}>Ride</Text></Text>
          <Text style={styles.tagline}>Ride Together · Save Together</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What is CampusRide?</Text>
          <Text style={styles.cardBody}>
            CampusRide is a student carpooling platform that connects classmates travelling
            the same route to college. Share a ride, split fuel costs, cut traffic, and
            reduce your carbon footprint — all within a trusted campus community.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          {features.map((f, i) => (
            <View key={i} style={[styles.featureRow, i === features.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${ADMIN_EMAIL}`)}>
            <Text style={styles.contactLink}>📧 {ADMIN_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Made with 💙 for students</Text>
      </ScrollView>
    </View>
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
  logoBox: { alignItems: 'center', paddingVertical: 24 },
  logoCircle: {
    width: 84, height: 84, borderRadius: 24, backgroundColor: '#1A56DB',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  logoText: { fontSize: 36, fontWeight: '900', color: '#ffffff', fontStyle: 'italic' },
  appName: { fontSize: 26, fontWeight: '900', color: '#0A0F2E' },
  tagline: { fontSize: 12, color: '#888', marginTop: 4, letterSpacing: 0.5 },
  version: { fontSize: 11, color: '#bbb', marginTop: 8, fontWeight: '600' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0A0F2E', marginBottom: 12 },
  cardBody: { fontSize: 13, color: '#555', lineHeight: 21 },
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#F8F9FF',
  },
  featureIcon: { fontSize: 22 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: '#0A0F2E', marginBottom: 2 },
  featureDesc: { fontSize: 12, color: '#888', lineHeight: 17 },
  contactLink: { fontSize: 14, color: '#1A56DB', fontWeight: '700' },
  footer: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 8 },
});
