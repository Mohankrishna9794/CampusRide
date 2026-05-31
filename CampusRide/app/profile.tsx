import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { initialOf } from '../constants/avatars';
import {
  listenUserProfile, listenHostedRides, listenSentRequests,
  UserProfile, RideRequest,
} from '@/lib/rideService';

export default function ProfileScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hostedRides, setHostedRides] = useState<any[]>([]);
  const [joined, setJoined] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      if (!u) { setLoading(false); router.replace('/login' as any); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubProfile = listenUserProfile(currentUser.uid, (p) => { setProfile(p); setLoading(false); });
    const unsubHosted = listenHostedRides(currentUser.uid, setHostedRides);
    const unsubSent = listenSentRequests(currentUser.uid, (_map, reqs) =>
      setJoined(reqs.filter(r => r.status === 'accepted')));
    return () => { unsubProfile(); unsubHosted(); unsubSent(); };
  }, [currentUser]);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.log('logout error', e); }
    router.replace('/login' as any);
  };

  // ---- Derived, real values ----
  const name = profile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';
  const email = profile?.email || currentUser?.email || '—';
  const dept = profile?.dept || 'Student';
  const year = profile?.year ? `${profile.year} Year` : '—';
  const subtitle = `${dept}${profile?.year ? ` • ${profile.year} Year` : ''}`;
  const rating = (profile?.rating ?? 5).toFixed(1);

  const ridesShared = hostedRides.length;
  const ridesTaken = joined.length;
  const co2Saved = (ridesShared + ridesTaken) * 2; // ~2kg saved per shared ride

  // Vehicle info comes from the user's most recent hosted ride
  const latestVehicle = hostedRides[0];
  const vehicleType = latestVehicle?.vehicleType
    ? (latestVehicle.vehicleType === 'car' ? 'Car' : 'Bike') : 'Not added';
  const vehicleNumber = latestVehicle?.vehicleNumber || 'Not added';
  const vehicleModel = latestVehicle?.vehicleModel || 'Not added';

  const fmtDate = (iso?: string) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' }); }
    catch { return ''; }
  };

  // Merge hosted + joined into one recent-rides feed
  const recentRides = [
    ...hostedRides.map(r => ({
      from: r.from, to: r.to, time: r.time, createdAt: r.createdAt,
      type: 'Hosted', color: '#1A56DB',
    })),
    ...joined.map(r => ({
      from: r.rideFrom, to: r.rideTo, time: r.rideTime, createdAt: r.createdAt,
      type: 'Joined', color: '#16A34A',
    })),
  ].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6);

  const personalInfo = [
    { icon: '📧', label: 'Email', val: email },
    { icon: '📱', label: 'Phone', val: profile?.phone || '—' },
    { icon: '🎓', label: 'Department', val: dept },
    { icon: '📅', label: 'Year', val: year },
  ];

  const vehicleInfo = [
    { icon: '🏍️', label: 'Vehicle Type', val: vehicleType },
    { icon: '🔢', label: 'Vehicle Number', val: vehicleNumber },
    { icon: '🏎️', label: 'Vehicle Model', val: vehicleModel },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.avatarBig}>
          <Text style={styles.avatarBigText}>{initialOf(name)}</Text>
        </View>
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.profileDept}>{subtitle}</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {rating} Rating</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { val: String(ridesShared), label: 'Rides Shared', color: '#1A56DB' },
            { val: String(ridesTaken), label: 'Rides Taken', color: '#2563EB' },
            { val: `${co2Saved}kg`, label: 'CO₂ Saved', color: '#16A34A' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Personal Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Personal Info</Text>
          {personalInfo.map((row, i) => (
            <View key={i} style={[styles.infoRow, i === personalInfo.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>{row.icon}</Text>
                <Text style={styles.infoLabel}>{row.label}</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoVal}>{row.val}</Text>
                <Text style={styles.infoArrow}>›</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Vehicle Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚘 Vehicle Info</Text>
          {vehicleInfo.map((row, i) => (
            <View key={i} style={[styles.infoRow, i === vehicleInfo.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>{row.icon}</Text>
                <Text style={styles.infoLabel}>{row.label}</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoVal}>{row.val}</Text>
                <Text style={styles.infoArrow}>›</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ride History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕐 Recent Rides</Text>
          {recentRides.length === 0 ? (
            <Text style={styles.emptyHistory}>No rides yet — host or join a ride to get started.</Text>
          ) : recentRides.map((ride, i) => (
            <View key={i} style={[styles.rideHistoryRow, i === recentRides.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.infoLeft}>
                <View style={[styles.historyDot, { backgroundColor: ride.color }]} />
                <View>
                  <Text style={styles.historyRoute}>{ride.from} → {ride.to}</Text>
                  <Text style={styles.historyTime}>{fmtDate(ride.createdAt)} {ride.time}</Text>
                </View>
              </View>
              <View style={[styles.historyBadge, { backgroundColor: ride.color + '18' }]}>
                <Text style={[styles.historyBadgeText, { color: ride.color }]}>{ride.type}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Settings</Text>
          {[
            { icon: '🔔', label: 'Notifications', route: '/notifications' },
            { icon: '🔒', label: 'Change Password', route: '/change-password' },
            { icon: '❓', label: 'Help & Support', route: '/help-support' },
            { icon: 'ℹ️', label: 'About CampusRide', route: '/about' },
          ].map((row, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.infoRow, i === 3 && { borderBottomWidth: 0 }]}
              onPress={() => router.push(row.route as any)}
            >
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>{row.icon}</Text>
                <Text style={styles.infoLabel}>{row.label}</Text>
              </View>
              <Text style={styles.infoArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', route: '/home', i: 0 },
          { icon: '🔍', label: 'Find', route: '/find', i: 1 },
          { icon: '➕', label: 'Host', route: '/host', i: 2 },
          { icon: '💬', label: 'Chat', route: '/chat', i: 3 },
          { icon: '👤', label: 'Profile', route: '/profile', i: 4 },
        ].map(nav => (
          <TouchableOpacity key={nav.i} style={styles.navItem} onPress={() => router.push(nav.route as any)}>
            <Text style={styles.navIcon}>{nav.icon}</Text>
            <Text style={[styles.navLabel, nav.i === 4 && styles.navLabelActive]}>{nav.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    backgroundColor: '#1A56DB', paddingTop: 52, paddingBottom: 28,
    paddingHorizontal: 20, borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40, alignItems: 'center',
  },
  backBtn: { position: 'absolute', top: 52, left: 20, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  backText: { fontSize: 13, color: '#ffffff', fontWeight: '700' },
  avatarBig: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarBigText: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  profileName: { fontSize: 20, fontWeight: '900', color: '#ffffff', marginBottom: 4 },
  profileDept: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
  ratingBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  ratingText: { fontSize: 12, color: '#ffffff', fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statVal: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 9, color: '#888', fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0A0F2E', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8F9FF' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { fontSize: 18 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#0A0F2E' },
  infoRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoVal: { fontSize: 12, color: '#888' },
  infoArrow: { fontSize: 14, color: '#bbb' },
  rideHistoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8F9FF' },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  historyRoute: { fontSize: 13, fontWeight: '600', color: '#0A0F2E' },
  historyTime: { fontSize: 11, color: '#888', marginTop: 2 },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  historyBadgeText: { fontSize: 11, fontWeight: '700' },
  emptyHistory: { fontSize: 12, color: '#888', textAlign: 'center', paddingVertical: 10 },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  logoutText: { fontSize: 14, fontWeight: '800', color: '#EF4444' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#E8EEFF', flexDirection: 'row', paddingBottom: 20, paddingTop: 10, elevation: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  navLabelActive: { color: '#1A56DB' },
});