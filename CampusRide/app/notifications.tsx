import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { listenReceivedRequests, listenSentRequests, RideRequest } from '@/lib/rideService';

interface Notice {
  id: string;
  icon: string;
  title: string;
  sub: string;
  createdAt: string;
  route?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [received, setReceived] = useState<RideRequest[]>([]);
  const [sent, setSent] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    const unsubR = listenReceivedRequests(currentUser.uid, (d) => { setReceived(d); setLoading(false); });
    const unsubS = listenSentRequests(currentUser.uid, (_m, reqs) => setSent(reqs));
    return () => { unsubR(); unsubS(); };
  }, [currentUser]);

  // Build notifications from real request activity
  const notices: Notice[] = [
    // Someone requested YOUR ride
    ...received
      .filter(r => r.status === 'pending')
      .map(r => ({
        id: `recv_${r.id}`,
        icon: '🙋',
        title: `${r.passengerName} requested your ride`,
        sub: `${r.rideFrom} → ${r.rideTo} · ${r.rideTime}`,
        createdAt: r.createdAt,
        route: '/requests',
      })),
    // Your sent request was answered
    ...sent
      .filter(r => r.status !== 'pending')
      .map(r => ({
        id: `sent_${r.id}`,
        icon: r.status === 'accepted' ? '✅' : '❌',
        title: r.status === 'accepted'
          ? `${r.hostName} accepted your request`
          : `${r.hostName} declined your request`,
        sub: `${r.rideFrom} → ${r.rideTo} · ${r.rideTime}`,
        createdAt: r.createdAt,
        route: r.status === 'accepted' ? '/chat' : '/requests',
      })),
  ].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const fmt = (iso?: string) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/profile' as any)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {loading ? (
          <View style={styles.emptyBox}><ActivityIndicator size="large" color="#1A56DB" /></View>
        ) : notices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : notices.map(n => (
          <TouchableOpacity
            key={n.id}
            style={styles.card}
            onPress={() => n.route && router.push(n.route as any)}
          >
            <Text style={styles.cardIcon}>{n.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{n.title}</Text>
              <Text style={styles.cardSub}>{n.sub}</Text>
              <Text style={styles.cardTime}>{fmt(n.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  emptyBox: { alignItems: 'center', padding: 50, backgroundColor: '#ffffff', borderRadius: 18, marginTop: 12 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#888' },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0A0F2E', marginBottom: 3 },
  cardSub: { fontSize: 12, color: '#888', marginBottom: 4 },
  cardTime: { fontSize: 10, color: '#bbb', fontWeight: '600' },
});
