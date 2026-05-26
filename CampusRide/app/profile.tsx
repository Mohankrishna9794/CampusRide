import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.avatarBig}>
          <Text style={styles.avatarBigText}>ME</Text>
        </View>
        <Text style={styles.profileName}>Student Name</Text>
        <Text style={styles.profileDept}>Computer Science • 3rd Year</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ 4.8 Rating</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { val: '12', label: 'Rides Shared', color: '#1A56DB' },
            { val: '28', label: 'Rides Taken', color: '#2563EB' },
            { val: '8kg', label: 'CO₂ Saved', color: '#16A34A' },
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
          {[
            { icon: '📧', label: 'Email', val: 'student@college.edu' },
            { icon: '📱', label: 'Phone', val: '+91 98765 43210' },
            { icon: '🎓', label: 'Department', val: 'Computer Science' },
            { icon: '📅', label: 'Year', val: '3rd Year' },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, i === 3 && { borderBottomWidth: 0 }]}>
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
          {[
            { icon: '🏍️', label: 'Vehicle Type', val: 'Bike' },
            { icon: '🔢', label: 'Vehicle Number', val: 'TN01AB1234' },
            { icon: '🏎️', label: 'Vehicle Model', val: 'Honda Activa' },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, i === 2 && { borderBottomWidth: 0 }]}>
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
          {[
            { from: 'Adyar Signal', to: 'College', time: 'Today 8:15 AM', type: 'Hosted', color: '#1A56DB' },
            { from: 'Velachery', to: 'College', time: 'Yesterday 8:30 AM', type: 'Joined', color: '#16A34A' },
            { from: 'Tambaram', to: 'College', time: 'Mon 7:55 AM', type: 'Joined', color: '#16A34A' },
          ].map((ride, i) => (
            <View key={i} style={[styles.rideHistoryRow, i === 2 && { borderBottomWidth: 0 }]}>
              <View style={styles.infoLeft}>
                <View style={[styles.historyDot, { backgroundColor: ride.color }]} />
                <View>
                  <Text style={styles.historyRoute}>{ride.from} → {ride.to}</Text>
                  <Text style={styles.historyTime}>{ride.time}</Text>
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
            { icon: '🔔', label: 'Notifications' },
            { icon: '🔒', label: 'Change Password' },
            { icon: '❓', label: 'Help & Support' },
            { icon: 'ℹ️', label: 'About CampusRide' },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, i === 3 && { borderBottomWidth: 0 }]}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>{row.icon}</Text>
                <Text style={styles.infoLabel}>{row.label}</Text>
              </View>
              <Text style={styles.infoArrow}>›</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace('/login' as any)}
        >
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
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  logoutText: { fontSize: 14, fontWeight: '800', color: '#EF4444' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#E8EEFF', flexDirection: 'row', paddingBottom: 20, paddingTop: 10, elevation: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  navLabelActive: { color: '#1A56DB' },
});