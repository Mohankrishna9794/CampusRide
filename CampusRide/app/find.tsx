import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

const rides = [
  { id:'1', host:'Arjun M.', avatar:'A', from:'Adyar Signal', to:'College Main Gate', time:'8:15 AM', vehicle:'Honda Activa', type:'bike', seats:1, distance:'4.2 km', dept:'CSE • 3rd Year', fuel:'₹20', color:'#1A56DB' },
  { id:'2', host:'Priya S.', avatar:'P', from:'Velachery Bus Stop', to:'College Main Gate', time:'8:30 AM', vehicle:'Swift Dzire', type:'car', seats:3, distance:'6.8 km', dept:'AIML • 2nd Year', fuel:'₹30', color:'#2563EB' },
  { id:'3', host:'Rahul K.', avatar:'R', from:'Tambaram Station', to:'College Side Gate', time:'7:55 AM', vehicle:'Pulsar 150', type:'bike', seats:1, distance:'9.1 km', dept:'ECE • 4th Year', fuel:'₹25', color:'#1D4ED8' },
  { id:'4', host:'Sneha T.', avatar:'S', from:'Pallavaram', to:'College Main Gate', time:'8:45 AM', vehicle:'i10 Grand', type:'car', seats:2, distance:'7.3 km', dept:'IT • 3rd Year', fuel:'₹25', color:'#1A56DB' },
  { id:'5', host:'Karthik R.', avatar:'K', from:'Guindy Station', to:'College Main Gate', time:'8:00 AM', vehicle:'Activa 6G', type:'bike', seats:1, distance:'5.5 km', dept:'MECH • 2nd Year', fuel:'₹15', color:'#2563EB' },
  { id:'6', host:'Divya M.', avatar:'D', from:'Chromepet Signal', to:'College Main Gate', time:'8:20 AM', vehicle:'WagonR', type:'car', seats:3, distance:'8.2 km', dept:'EEE • 3rd Year', fuel:'₹30', color:'#1D4ED8' },
];

export default function FindScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [requested, setRequested] = useState<{[key:string]:boolean}>({});

  const filtered = rides.filter(r => {
    const matchFilter = filter === 'all' || r.type === filter;
    const matchSearch = !search ||
      r.from.toLowerCase().includes(search.toLowerCase()) ||
      r.host.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Ride</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location or name..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All Rides' },
          { key: 'car', label: '🚗 Cars' },
          { key: 'bike', label: '🏍 Bikes' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.countText}>{filtered.length} rides</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🚫</Text>
            <Text style={styles.emptyText}>No rides found</Text>
            <TouchableOpacity onPress={() => { setSearch(''); setFilter('all'); }}>
              <Text style={styles.emptyLink}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(ride => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={[styles.cardAccent, { backgroundColor: ride.color }]} />
              <View style={styles.cardTop}>
                <View style={styles.hostRow}>
                  <View style={[styles.hostAvatar, { backgroundColor: ride.color + '22' }]}>
                    <Text style={[styles.hostAvatarText, { color: ride.color }]}>{ride.avatar}</Text>
                  </View>
                  <View>
                    <Text style={styles.hostName}>{ride.host}</Text>
                    <Text style={styles.hostDept}>{ride.dept}</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.timeText}>{ride.time}</Text>
                  <Text style={styles.timeLabel}>departure</Text>
                </View>
              </View>
              <View style={styles.routeBox}>
                <View style={styles.routeRow}>
                  <View style={styles.routeDot} />
                  <Text style={styles.routeText}>{ride.from}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: ride.color }]} />
                  <Text style={styles.routeText}>{ride.to}</Text>
                </View>
                <Text style={styles.distanceText}>{ride.distance}</Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.chipsRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{ride.type === 'car' ? '🚗' : '🏍'} {ride.vehicle}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: ride.color + '15' }]}>
                    <Text style={[styles.chipText, { color: ride.color }]}>{ride.seats} seat{ride.seats > 1 ? 's' : ''}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: '#16A34A15' }]}>
                    <Text style={[styles.chipText, { color: '#16A34A' }]}>⛽ {ride.fuel}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.reqBtn, requested[ride.id] && styles.reqBtnDone]}
                  onPress={() => setRequested(r => ({ ...r, [ride.id]: true }))}
                  disabled={!!requested[ride.id]}
                >
                  <Text style={[styles.reqBtnText, requested[ride.id] && styles.reqBtnTextDone]}>
                    {requested[ride.id] ? '✓ Sent' : 'Request'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
            <Text style={[styles.navLabel, nav.i === 1 && styles.navLabelActive]}>{nav.label}</Text>
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
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 14, margin: 16, marginBottom: 10, paddingHorizontal: 14, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#0A0F2E' },
  clearBtn: { fontSize: 12, color: '#aaa', paddingHorizontal: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 14, alignItems: 'center' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E8EEFF' },
  filterBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#888' },
  filterTextActive: { color: '#ffffff' },
  countText: { marginLeft: 'auto', fontSize: 11, color: '#aaa', fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 16 },
  emptyBox: { alignItems: 'center', padding: 60, backgroundColor: '#ffffff', borderRadius: 18, marginBottom: 12 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#888', marginBottom: 8 },
  emptyLink: { fontSize: 14, color: '#1A56DB', fontWeight: '700' },
  rideCard: { backgroundColor: '#ffffff', borderRadius: 18, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, position: 'relative', overflow: 'hidden' },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingLeft: 8 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hostAvatarText: { fontSize: 13, fontWeight: '800' },
  hostName: { fontSize: 13, fontWeight: '700', color: '#0A0F2E' },
  hostDept: { fontSize: 10, color: '#888', marginTop: 1 },
  timeText: { fontSize: 14, fontWeight: '800', color: '#1A56DB', textAlign: 'right' },
  timeLabel: { fontSize: 9, color: '#aaa', textAlign: 'right' },
  routeBox: { backgroundColor: '#F8F9FF', borderRadius: 10, padding: 10, marginBottom: 10, marginLeft: 8, position: 'relative' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' },
  routeLine: { width: 2, height: 10, backgroundColor: '#E8EEFF', marginLeft: 2.5, marginVertical: 3 },
  routeText: { fontSize: 12, color: '#333', fontWeight: '500' },
  distanceText: { position: 'absolute', right: 10, top: '50%', fontSize: 10, color: '#aaa', fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 },
  chipsRow: { flexDirection: 'row', gap: 5, flex: 1, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, backgroundColor: '#EEF2FF' },
  chipText: { fontSize: 10, color: '#555', fontWeight: '600' },
  reqBtn: { backgroundColor: '#1A56DB', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7, marginLeft: 8 },
  reqBtnDone: { backgroundColor: '#E8F5E9' },
  reqBtnText: { fontSize: 11, fontWeight: '800', color: '#ffffff' },
  reqBtnTextDone: { color: '#16A34A' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#E8EEFF', flexDirection: 'row', paddingBottom: 20, paddingTop: 10, elevation: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  navLabelActive: { color: '#1A56DB' },
});