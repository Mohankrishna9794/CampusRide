import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Dimensions, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import {
  sendRideRequest, listenSentRequests, listenPendingCount,
} from '@/lib/rideService';

const { width } = Dimensions.get('window');

const LOCATION_SUGGESTIONS = [
  'Adyar Signal', 'Adyar Bus Stop', 'Velachery Bus Stop',
  'Velachery Main Road', 'Tambaram Station', 'Tambaram Bus Stand',
  'Pallavaram Signal', 'Guindy Station', 'Chromepet Signal',
  'Medavakkam Junction', 'Perungudi Signal', 'Sholinganallur Signal',
  'Porur Junction', 'Ambattur Estate', 'College Main Gate',
  'College Side Gate', 'College Back Gate',
];

export default function HomeScreen() {
  const router = useRouter();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<'pickup' | 'drop' | null>(null);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('all');
  const [requestStatus, setRequestStatus] = useState<{ [key: string]: string }>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Track auth, then the current user's request state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) { setPendingCount(0); setRequestStatus({}); return; }
    const unsubPending = listenPendingCount(currentUser.uid, setPendingCount);
    const unsubSent = listenSentRequests(currentUser.uid, (map) => setRequestStatus(map));
    return () => { unsubPending(); unsubSent(); };
  }, [currentUser]);

  const handleRequest = async (ride: any) => {
    if (!currentUser) { router.push('/login' as any); return; }
    if (ride.hostId === currentUser.uid) return; // can't request your own ride
    try {
      await sendRideRequest(ride);
      setRequestStatus(s => ({ ...s, [ride.id]: 'pending' }));
    } catch (e) {
      console.log('request error', e);
    }
  };

  // Load rides from Firestore in real time
  useEffect(() => {
    const q = query(
      collection(db, 'rides'),
      where('status', '==', 'active')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(ridesData);
      setLoading(false);
    }, (error) => {
      console.log('Error loading rides:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalCars = rides.filter(r => r.vehicleType === 'car').length;
  const totalBikes = rides.filter(r => r.vehicleType === 'bike').length;
  const totalSeats = rides.reduce((acc, r) => acc + (r.seats || 0), 0);

  const filtered = rides.filter(r => {
    const matchFilter = filter === 'all' || r.vehicleType === filter;
    const matchPickup = !searched ||
      (r.from || '').toLowerCase().includes(pickup.toLowerCase());
    return matchFilter && matchPickup;
  });

  const handlePickupChange = (text: string) => {
    setPickup(text);
    if (text.length > 1) {
      const filtered = LOCATION_SUGGESTIONS.filter(l =>
        l.toLowerCase().includes(text.toLowerCase())
      );
      setPickupSuggestions(filtered.slice(0, 5));
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDropChange = (text: string) => {
    setDrop(text);
    if (text.length > 1) {
      const filtered = LOCATION_SUGGESTIONS.filter(l =>
        l.toLowerCase().includes(text.toLowerCase())
      );
      setDropSuggestions(filtered.slice(0, 5));
    } else {
      setDropSuggestions([]);
    }
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    setTimeout(() => {
      setPickup('Adyar Signal');
      setDetectingLocation(false);
      setPickupSuggestions([]);
    }, 1500);
  };

  const handleSearch = () => {
    if (!pickup || !drop) return;
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setSearched(true);
  };

  const clearSearch = () => {
    setPickup('');
    setDrop('');
    setSearched(false);
    setPickupSuggestions([]);
    setDropSuggestions([]);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.headerTitle}>Where are you going?</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/requests' as any)}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {pendingCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{pendingCount > 9 ? '9+' : pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/profile' as any)}
          >
            <Text style={styles.avatarText}>ME</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationCardHeader}>
            <Text style={styles.locationTitle}>🗺️ Plan Your Ride</Text>
            {searched && (
              <TouchableOpacity onPress={clearSearch}>
                <Text style={styles.modifyBtn}>✏️ Modify</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pickup */}
          <View style={styles.locRow}>
            <View style={styles.dotGreen} />
            <View style={styles.locInputBox}>
              <TextInput
                style={styles.locInput}
                placeholder="Enter pickup location"
                placeholderTextColor="#aaa"
                value={pickup}
                onChangeText={handlePickupChange}
                onFocus={() => setActiveInput('pickup')}
              />
              {pickup.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setPickup('');
                  setPickupSuggestions([]);
                }}>
                  <Text style={styles.clearBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.locActionBtn} onPress={detectLocation}>
              {detectingLocation
                ? <ActivityIndicator size="small" color="#1A56DB" />
                : <Text style={styles.locActionIcon}>📍</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Pickup suggestions */}
          {pickupSuggestions.length > 0 && activeInput === 'pickup' && (
            <View style={styles.suggestionsBox}>
              {pickupSuggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionItem,
                    i < pickupSuggestions.length - 1 && styles.suggestionBorder]}
                  onPress={() => {
                    setPickup(s);
                    setPickupSuggestions([]);
                    setActiveInput(null);
                  }}
                >
                  <Text style={styles.suggestionIcon}>📍</Text>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Connector */}
          <View style={styles.connector}>
            <View style={styles.connectorDot} />
            <View style={styles.connectorDot} />
            <View style={styles.connectorDot} />
          </View>

          {/* Drop */}
          <View style={styles.locRow}>
            <View style={styles.dotBlue} />
            <View style={styles.locInputBox}>
              <TextInput
                style={styles.locInput}
                placeholder="Enter drop location"
                placeholderTextColor="#aaa"
                value={drop}
                onChangeText={handleDropChange}
                onFocus={() => setActiveInput('drop')}
              />
              {drop.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setDrop('');
                  setDropSuggestions([]);
                }}>
                  <Text style={styles.clearBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.locActionBtn}
              onPress={() => {
                const temp = pickup;
                setPickup(drop);
                setDrop(temp);
              }}
            >
              <Text style={styles.locActionIcon}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Drop suggestions */}
          {dropSuggestions.length > 0 && activeInput === 'drop' && (
            <View style={styles.suggestionsBox}>
              {dropSuggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionItem,
                    i < dropSuggestions.length - 1 && styles.suggestionBorder]}
                  onPress={() => {
                    setDrop(s);
                    setDropSuggestions([]);
                    setActiveInput(null);
                  }}
                >
                  <Text style={styles.suggestionIcon}>🏁</Text>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchBtn, (!pickup || !drop) && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={!pickup || !drop}
          >
            <Text style={styles.searchBtnText}>🔍 Find Available Rides</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard}
            onPress={() => router.push('/find' as any)}>
            <Text style={styles.quickIcon}>🔍</Text>
            <Text style={styles.quickLabel}>Find Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#1A56DB' }]}
            onPress={() => router.push('/host' as any)}>
            <Text style={styles.quickIcon}>➕</Text>
            <Text style={[styles.quickLabel, { color: '#ffffff' }]}>Host Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}
            onPress={() => router.push('/chat' as any)}>
            <Text style={styles.quickIcon}>💬</Text>
            <Text style={styles.quickLabel}>Messages</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Cars Available', value: String(totalCars), icon: '🚗', color: '#2563EB' },
            { label: 'Bikes Available', value: String(totalBikes), icon: '🏍️', color: '#1D4ED8' },
            { label: 'Seats Free', value: String(totalSeats), icon: '💺', color: '#16A34A' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { borderTopColor: s.color, borderTopWidth: 3 }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Rides Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searched ? `Rides from "${pickup}"` : 'Available Rides Today'}
          </Text>
          <View style={styles.filterBtns}>
            {['all', 'car', 'bike'].map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === 'all' ? 'All' : f === 'car' ? '🚗' : '🏍'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rides List */}
        <View style={{ paddingHorizontal: 16 }}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1A56DB" />
              <Text style={styles.loadingText}>Loading rides...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyText}>
                {searched ? `No rides from "${pickup}"` : 'No rides available right now'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/host' as any)}>
                <Text style={styles.emptyLink}>Be the first to host a ride! →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map(ride => (
              <View key={ride.id} style={styles.rideCard}>
                <View style={[styles.cardAccent, { backgroundColor: ride.color || '#1A56DB' }]} />

                <View style={styles.cardTop}>
                  <View style={styles.hostRow}>
                    <View style={[styles.hostAvatar,
                      { backgroundColor: (ride.color || '#1A56DB') + '22' }]}>
                      <Text style={[styles.hostAvatarText,
                        { color: ride.color || '#1A56DB' }]}>
                        {ride.avatar || ride.hostName?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.hostName}>{ride.hostName}</Text>
                      <Text style={styles.hostDept}>{ride.Dept || ride.dept || 'Student'}</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.timeText}>{ride.time}</Text>
                    <Text style={styles.timeLabel}>departure</Text>
                  </View>
                </View>

                <View style={styles.routeBox}>
                  <View style={styles.routeRow}>
                    <View style={styles.routeDotGreen} />
                    <Text style={styles.routeText}>{ride.from}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routeRow}>
                    <View style={[styles.routeDotGreen,
                      { backgroundColor: ride.color || '#1A56DB' }]} />
                    <Text style={styles.routeText}>{ride.to}</Text>
                  </View>
                  <Text style={styles.distanceText}>{ride.distance}</Text>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.chipsRow}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>
                        {ride.vehicleType === 'car' ? '🚗' : '🏍'} {ride.vehicleModel}
                      </Text>
                    </View>
                    <View style={[styles.chip,
                      { backgroundColor: (ride.color || '#1A56DB') + '15' }]}>
                      <Text style={[styles.chipText, { color: ride.color || '#1A56DB' }]}>
                        {ride.seats} seat{ride.seats > 1 ? 's' : ''} free
                      </Text>
                    </View>
                    <View style={[styles.chip, { backgroundColor: '#16A34A15' }]}>
                      <Text style={[styles.chipText, { color: '#16A34A' }]}>
                        ⛽ ₹{ride.fuel}
                      </Text>
                    </View>
                  </View>
                  {ride.hostId === currentUser?.uid ? (
                    <View style={[styles.reqBtn, styles.reqBtnDone]}>
                      <Text style={[styles.reqBtnText, styles.reqBtnTextDone]}>Your ride</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.reqBtn, requestStatus[ride.id] && styles.reqBtnDone]}
                      onPress={() => handleRequest(ride)}
                      disabled={!!requestStatus[ride.id]}
                    >
                      <Text style={[styles.reqBtnText, requestStatus[ride.id] && styles.reqBtnTextDone]}>
                        {requestStatus[ride.id] === 'accepted' ? '✓ Accepted'
                          : requestStatus[ride.id] === 'pending' ? '✓ Sent'
                          : requestStatus[ride.id] === 'rejected' ? 'Declined'
                          : 'Request'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', key: 'home', route: '/home' },
          { icon: '🔍', label: 'Find', key: 'find', route: '/find' },
          { icon: '➕', label: 'Host', key: 'host', route: '/host' },
          { icon: '💬', label: 'Chat', key: 'chat', route: '/chat' },
          { icon: '👤', label: 'Profile', key: 'profile', route: '/profile' },
        ].map(nav => (
          <TouchableOpacity
            key={nav.key}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(nav.key);
              router.push(nav.route as any);
            }}
          >
            <Text style={styles.navIcon}>{nav.icon}</Text>
            <Text style={[styles.navLabel, activeTab === nav.key && styles.navLabelActive]}>
              {nav.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#1A56DB',
    paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  greeting: { fontSize: 13, color: '#ffffff90', fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  avatarBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#ffffff20', borderWidth: 2,
    borderColor: '#ffffff40', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, color: '#ffffff', fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffffff20',
    borderWidth: 2, borderColor: '#ffffff40', alignItems: 'center', justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },
  bellBadge: {
    position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5, borderWidth: 2, borderColor: '#1A56DB',
  },
  bellBadgeText: { fontSize: 10, color: '#ffffff', fontWeight: '800' },
  locationCard: {
    backgroundColor: '#ffffff', borderRadius: 20, margin: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  locationCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  locationTitle: { fontSize: 14, fontWeight: '800', color: '#0A0F2E' },
  modifyBtn: { fontSize: 12, color: '#1A56DB', fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#16A34A', flexShrink: 0 },
  dotBlue: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1A56DB', flexShrink: 0 },
  locInputBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FF', borderRadius: 10,
    borderWidth: 1, borderColor: '#E8EEFF', paddingHorizontal: 12, height: 44,
  },
  locInput: { flex: 1, fontSize: 13, color: '#0A0F2E', fontWeight: '500' },
  clearBtn: { fontSize: 11, color: '#aaa', paddingHorizontal: 4 },
  locActionBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#F0F4FF', borderWidth: 1,
    borderColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center',
  },
  locActionIcon: { fontSize: 16 },
  suggestionsBox: {
    backgroundColor: '#ffffff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E8EEFF',
    marginLeft: 22, marginTop: 4, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11, gap: 10,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F4FF' },
  suggestionIcon: { fontSize: 13 },
  suggestionText: { fontSize: 13, color: '#333', fontWeight: '500' },
  connector: {
    flexDirection: 'column', alignItems: 'flex-start',
    paddingLeft: 5, marginVertical: 3, gap: 3,
  },
  connectorDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1' },
  searchBtn: {
    backgroundColor: '#1A56DB', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 14, elevation: 6,
  },
  searchBtnDisabled: { backgroundColor: '#93B4F0' },
  searchBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  quickRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 14 },
  quickCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 16,
    padding: 14, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  quickIcon: { fontSize: 22 },
  quickLabel: { fontSize: 10, fontWeight: '700', color: '#333' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 14,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 9, color: '#888', fontWeight: '600', textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0A0F2E', flex: 1 },
  filterBtns: { flexDirection: 'row', gap: 6 },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E8EEFF',
  },
  filterBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#888' },
  filterTextActive: { color: '#ffffff' },
  loadingBox: { alignItems: 'center', padding: 40 },
  loadingText: { color: '#888', marginTop: 12, fontSize: 14 },
  emptyBox: {
    alignItems: 'center', padding: 40, backgroundColor: '#ffffff',
    borderRadius: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#888', marginBottom: 8, textAlign: 'center' },
  emptyLink: { fontSize: 14, color: '#1A56DB', fontWeight: '700' },
  rideCard: {
    backgroundColor: '#ffffff', borderRadius: 18, marginBottom: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    position: 'relative', overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12, paddingLeft: 8,
  },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hostAvatarText: { fontSize: 13, fontWeight: '800' },
  hostName: { fontSize: 13, fontWeight: '700', color: '#0A0F2E' },
  hostDept: { fontSize: 10, color: '#888', marginTop: 1 },
  timeText: { fontSize: 14, fontWeight: '800', color: '#1A56DB', textAlign: 'right' },
  timeLabel: { fontSize: 9, color: '#aaa', textAlign: 'right' },
  routeBox: {
    backgroundColor: '#F8F9FF', borderRadius: 10, padding: 10,
    marginBottom: 10, marginLeft: 8, position: 'relative',
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDotGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' },
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
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff', borderTopWidth: 1,
    borderTopColor: '#E8EEFF', flexDirection: 'row',
    paddingBottom: 20, paddingTop: 10, elevation: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  navLabelActive: { color: '#1A56DB' },
});