import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { colorFor, initialOf } from '../constants/avatars';
import {
  listenReceivedRequests, listenSentRequests,
  acceptRideRequest, rejectRideRequest, RideRequest,
} from '@/lib/rideService';

export default function RequestsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<{[key:string]: boolean}>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  // Requests other students sent to MY rides (I'm the host)
  useEffect(() => {
    if (!currentUser) { setReceived([]); setLoading(false); return; }
    const unsub = listenReceivedRequests(currentUser.uid, (data) => {
      setReceived(data);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  // Requests I sent to other people's rides (I'm the passenger)
  useEffect(() => {
    if (!currentUser) { setSent([]); return; }
    const unsub = listenSentRequests(currentUser.uid, (_map, requests) => setSent(requests));
    return () => unsub();
  }, [currentUser]);

  const acceptRequest = async (req: RideRequest) => {
    setBusy(b => ({ ...b, [req.id]: true }));
    try {
      await acceptRideRequest(req);
    } catch (e) {
      console.log('accept error', e);
    } finally {
      setBusy(b => ({ ...b, [req.id]: false }));
    }
  };

  const rejectRequest = async (req: RideRequest) => {
    setBusy(b => ({ ...b, [req.id]: true }));
    try {
      await rejectRideRequest(req);
    } catch (e) {
      console.log('reject error', e);
    } finally {
      setBusy(b => ({ ...b, [req.id]: false }));
    }
  };

  const statusChip = (status: string) => {
    const map: {[k:string]: {bg:string, color:string, label:string}} = {
      pending:  { bg: '#FEF3C7', color: '#B45309', label: '⏳ Pending' },
      accepted: { bg: '#DCFCE7', color: '#16A34A', label: '✓ Accepted' },
      rejected: { bg: '#FEE2E2', color: '#DC2626', label: '✕ Declined' },
    };
    const s = map[status] || map.pending;
    return (
      <View style={[styles.statusChip, { backgroundColor: s.bg }]}>
        <Text style={[styles.statusChipText, { color: s.color }]}>{s.label}</Text>
      </View>
    );
  };

  const list = tab === 'received' ? received : sent;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Requests</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'received' && styles.tabBtnActive]}
          onPress={() => setTab('received')}
        >
          <Text style={[styles.tabText, tab === 'received' && styles.tabTextActive]}>
            📥 Received{received.filter(r => r.status === 'pending').length > 0
              ? ` (${received.filter(r => r.status === 'pending').length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'sent' && styles.tabBtnActive]}
          onPress={() => setTab('sent')}
        >
          <Text style={[styles.tabText, tab === 'sent' && styles.tabTextActive]}>
            📤 Sent
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {loading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color="#1A56DB" />
          </View>
        ) : list.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>{tab === 'received' ? '📭' : '✈️'}</Text>
            <Text style={styles.emptyText}>
              {tab === 'received'
                ? 'No one has requested your rides yet'
                : 'You haven\'t requested any rides yet'}
            </Text>
          </View>
        ) : (
          list.map(req => {
            const isReceived = tab === 'received';
            const personName = isReceived ? req.passengerName : req.hostName;
            const personSub = isReceived ? (req.passengerDept || 'Student') : 'Ride Host';
            const c = colorFor(isReceived ? req.passengerId : req.hostId);
            return (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.personRow}>
                    <View style={[styles.avatar, { backgroundColor: c + '22' }]}>
                      <Text style={[styles.avatarText, { color: c }]}>{initialOf(personName)}</Text>
                    </View>
                    <View>
                      <Text style={styles.personName}>{personName}</Text>
                      <Text style={styles.personSub}>{personSub}</Text>
                    </View>
                  </View>
                  {statusChip(req.status)}
                </View>

                <View style={styles.routeBox}>
                  <Text style={styles.routeText}>📍 {req.rideFrom}  →  🏁 {req.rideTo}</Text>
                  <Text style={styles.routeMeta}>🕐 {req.rideTime}   🚗 {req.vehicleModel}</Text>
                </View>

                {isReceived && req.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => rejectRequest(req)}
                      disabled={!!busy[req.id]}
                    >
                      <Text style={styles.rejectBtnText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => acceptRequest(req)}
                      disabled={!!busy[req.id]}
                    >
                      <Text style={styles.acceptBtnText}>
                        {busy[req.id] ? 'Accepting...' : 'Accept ✓'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {req.status === 'accepted' && (
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() => router.push('/chat' as any)}
                  >
                    <Text style={styles.chatBtnText}>💬 Open Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', route: '/home' },
          { icon: '🔍', label: 'Find', route: '/find' },
          { icon: '➕', label: 'Host', route: '/host' },
          { icon: '💬', label: 'Chat', route: '/chat' },
          { icon: '👤', label: 'Profile', route: '/profile' },
        ].map(nav => (
          <TouchableOpacity key={nav.route} style={styles.navItem} onPress={() => router.push(nav.route as any)}>
            <Text style={styles.navIcon}>{nav.icon}</Text>
            <Text style={styles.navLabel}>{nav.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  tabRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  tabBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#E8EEFF',
  },
  tabBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#888' },
  tabTextActive: { color: '#ffffff' },
  list: { flex: 1 },
  emptyBox: { alignItems: 'center', padding: 50, backgroundColor: '#ffffff', borderRadius: 18, marginTop: 12 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  personName: { fontSize: 14, fontWeight: '800', color: '#0A0F2E' },
  personSub: { fontSize: 11, color: '#888', marginTop: 1 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusChipText: { fontSize: 10, fontWeight: '800' },
  routeBox: { backgroundColor: '#F8F9FF', borderRadius: 10, padding: 12, marginBottom: 12 },
  routeText: { fontSize: 13, color: '#0A0F2E', fontWeight: '600', marginBottom: 6 },
  routeMeta: { fontSize: 11, color: '#888', fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  rejectBtn: { backgroundColor: '#FEE2E2' },
  rejectBtnText: { fontSize: 13, fontWeight: '800', color: '#DC2626' },
  acceptBtn: { backgroundColor: '#1A56DB' },
  acceptBtnText: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  chatBtn: { backgroundColor: '#EEF2FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  chatBtnText: { fontSize: 13, fontWeight: '800', color: '#1A56DB' },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff',
    borderTopWidth: 1, borderTopColor: '#E8EEFF', flexDirection: 'row',
    paddingBottom: 20, paddingTop: 10, elevation: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#aaa', fontWeight: '600' },
});
