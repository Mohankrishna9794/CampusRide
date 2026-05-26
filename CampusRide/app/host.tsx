import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const SUGGESTIONS = [
  'Adyar Signal', 'Adyar Bus Stop', 'Velachery Bus Stop',
  'Tambaram Station', 'Pallavaram Signal', 'Guindy Station',
  'Chromepet Signal', 'Medavakkam Junction', 'Perungudi Signal',
  'Sholinganallur Signal', 'Porur Junction', 'Ambattur Estate',
];

export default function HostScreen() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [time, setTime] = useState('');
  const [vehicle, setVehicle] = useState('bike');
  const [seats, setSeats] = useState(1);
  const [fuel, setFuel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [posted, setPosted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFromChange = (text: string) => {
    setFrom(text);
    if (text.length > 1) {
      const filtered = SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 4));
    } else {
      setSuggestions([]);
    }
  };

  const handlePost = async () => {
    if (!from || !time || !vehicleNumber || !vehicleModel) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'rides'), {
        hostId: user?.uid || 'guest',
        hostName: user?.displayName || user?.email?.split('@')[0] || 'Student',
        from,
        to: 'College Main Gate',
        time,
        vehicleType: vehicle,
        vehicleNumber,
        vehicleModel,
        seats,
        fuel: fuel || '0',
        distance: 'N/A',
        avatar: (user?.email?.charAt(0) || 'S').toUpperCase(),
        color: '#1A56DB',
        dept: 'Student',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      setPosted(true);
    } catch (err) {
      console.log(err);
      setError('Failed to post ride. Please try again');
    } finally {
      setLoading(false);
    }
  };

  if (posted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Ride Posted!</Text>
          <Text style={styles.successSub}>
            Students near your route will see your ride and can request to join.
          </Text>
          <View style={styles.ridePreview}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>From</Text>
              <Text style={styles.previewVal}>{from}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>To</Text>
              <Text style={styles.previewVal}>College Main Gate</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Time</Text>
              <Text style={styles.previewVal}>{time}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Vehicle</Text>
              <Text style={styles.previewVal}>
                {vehicle === 'bike' ? '🏍️' : '🚗'} {vehicleModel}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Seats</Text>
              <Text style={styles.previewVal}>{seats} Available</Text>
            </View>
            <View style={[styles.previewRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.previewLabel}>Fuel</Text>
              <Text style={styles.previewVal}>₹{fuel || '0'} per person</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/home' as any)}
          >
            <Text style={styles.homeBtnText}>Go to Home 🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.anotherBtn}
            onPress={() => {
              setPosted(false);
              setFrom('');
              setTime('');
              setVehicleNumber('');
              setVehicleModel('');
              setFuel('');
              setSeats(1);
              setVehicle('bike');
            }}
          >
            <Text style={styles.anotherBtnText}>Post Another Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/home' as any)}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host a Ride</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.form}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Route Details</Text>

          <Text style={styles.label}>Starting Point *</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Adyar Signal"
              placeholderTextColor="#aaa"
              value={from}
              onChangeText={handleFromChange}
            />
            {from.length > 0 && (
              <TouchableOpacity onPress={() => { setFrom(''); setSuggestions([]); }}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {suggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionItem,
                    i < suggestions.length - 1 && styles.suggestionBorder]}
                  onPress={() => { setFrom(s); setSuggestions([]); }}
                >
                  <Text style={styles.suggestionIcon}>📍</Text>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Destination</Text>
          <View style={[styles.inputBox, { opacity: 0.6 }]}>
            <Text style={styles.inputIcon}>🏁</Text>
            <TextInput
              style={styles.input}
              value="College Main Gate"
              editable={false}
            />
          </View>
        </View>

        {/* Time Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏰ Departure Time *</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>🕐</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 08:00 AM"
              placeholderTextColor="#aaa"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Vehicle Type */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚗 Vehicle Type *</Text>
          <View style={styles.vehicleRow}>
            {[
              { key: 'bike', icon: '🏍️', label: 'Bike' },
              { key: 'car', icon: '🚗', label: 'Car' },
            ].map(v => (
              <TouchableOpacity
                key={v.key}
                style={[styles.vehicleBtn, vehicle === v.key && styles.vehicleBtnActive]}
                onPress={() => { setVehicle(v.key); setSeats(1); }}
              >
                <Text style={styles.vehicleIcon}>{v.icon}</Text>
                <Text style={[styles.vehicleLabel,
                  vehicle === v.key && styles.vehicleLabelActive]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Seats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🪑 Available Seats *</Text>
          <View style={styles.seatsRow}>
            {(vehicle === 'bike' ? [1] : [1, 2, 3]).map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.seatBtn, seats === s && styles.seatBtnActive]}
                onPress={() => setSeats(s)}
              >
                <Text style={[styles.seatText, seats === s && styles.seatTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.seatHint}>
            {vehicle === 'bike'
              ? '🏍️ Bikes can carry 1 passenger'
              : '🚗 Select number of passengers you can carry'}
          </Text>
        </View>

        {/* Vehicle Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚘 Vehicle Details *</Text>
          <Text style={styles.label}>Vehicle Number</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>🔢</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. TN01AB1234"
              placeholderTextColor="#aaa"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
            />
          </View>
          <Text style={styles.label}>Vehicle Model</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>🏎️</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Honda Activa / Swift Dzire"
              placeholderTextColor="#aaa"
              value={vehicleModel}
              onChangeText={setVehicleModel}
            />
          </View>
        </View>

        {/* Fuel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⛽ Fuel Contribution (₹)</Text>
          <Text style={styles.fuelHint}>
            Enter only fuel cost per person — no profit allowed
          </Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>💰</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 20"
              placeholderTextColor="#aaa"
              value={fuel}
              onChangeText={setFuel}
              keyboardType="numeric"
            />
            <Text style={styles.rupeeLabel}>₹ per person</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

        <TouchableOpacity
          style={[styles.postBtn, loading && styles.postBtnLoading]}
          onPress={handlePost}
          disabled={loading}
        >
          <Text style={styles.postBtnText}>
            {loading ? 'Posting Ride...' : 'Post My Ride 🚀'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🛡️ Your vehicle number is visible only to confirmed passengers for safety.
          </Text>
        </View>

      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', route: '/home', i: 0 },
          { icon: '🔍', label: 'Find', route: '/find', i: 1 },
          { icon: '➕', label: 'Host', route: '/host', i: 2 },
          { icon: '💬', label: 'Chat', route: '/chat', i: 3 },
          { icon: '👤', label: 'Profile', route: '/profile', i: 4 },
        ].map(nav => (
          <TouchableOpacity
            key={nav.i}
            style={styles.navItem}
            onPress={() => router.push(nav.route as any)}
          >
            <Text style={styles.navIcon}>{nav.icon}</Text>
            <Text style={[styles.navLabel, nav.i === 2 && styles.navLabelActive]}>
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
  backBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backText: { fontSize: 13, color: '#ffffff', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
  form: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 18,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0A0F2E', marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: '#0A0F2E', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F9FF', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    paddingHorizontal: 14, height: 50, marginBottom: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#0A0F2E', fontWeight: '500' },
  clearBtn: { fontSize: 12, color: '#aaa', paddingHorizontal: 4 },
  suggestionsBox: {
    backgroundColor: '#ffffff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E8EEFF',
    marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F4FF' },
  suggestionIcon: { fontSize: 14 },
  suggestionText: { fontSize: 13, color: '#333', fontWeight: '500' },
  vehicleRow: { flexDirection: 'row', gap: 12 },
  vehicleBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    backgroundColor: '#F8F9FF', alignItems: 'center',
  },
  vehicleBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#1A56DB' },
  vehicleIcon: { fontSize: 32, marginBottom: 6 },
  vehicleLabel: { fontSize: 13, fontWeight: '700', color: '#888' },
  vehicleLabelActive: { color: '#1A56DB' },
  seatsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  seatBtn: {
    width: 52, height: 52, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E8EEFF',
    backgroundColor: '#F8F9FF', alignItems: 'center', justifyContent: 'center',
  },
  seatBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  seatText: { fontSize: 16, fontWeight: '800', color: '#888' },
  seatTextActive: { color: '#ffffff' },
  seatHint: { fontSize: 11, color: '#aaa', fontWeight: '500', marginTop: 4 },
  fuelHint: { fontSize: 11, color: '#aaa', marginBottom: 10 },
  rupeeLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  errorText: {
    fontSize: 13, color: '#EF4444', marginBottom: 14,
    fontWeight: '500', textAlign: 'center',
  },
  postBtn: {
    backgroundColor: '#1A56DB', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12, marginBottom: 14,
  },
  postBtnLoading: { backgroundColor: '#1A56DB99' },
  postBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  infoBox: {
    backgroundColor: '#EEF2FF', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  infoText: { fontSize: 12, color: '#1A56DB', fontWeight: '500', lineHeight: 18 },
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
  successContainer: {
    flex: 1, backgroundColor: '#F8F9FF',
    justifyContent: 'center', padding: 20,
  },
  successCard: {
    backgroundColor: '#ffffff', borderRadius: 24,
    padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 8,
  },
  successEmoji: { fontSize: 60, marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#0A0F2E', marginBottom: 8 },
  successSub: {
    fontSize: 14, color: '#888', textAlign: 'center',
    lineHeight: 22, marginBottom: 20,
  },
  ridePreview: {
    width: '100%', backgroundColor: '#F8F9FF',
    borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#E8EEFF',
  },
  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8EEFF',
  },
  previewLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  previewVal: { fontSize: 12, color: '#0A0F2E', fontWeight: '700' },
  homeBtn: {
    width: '100%', backgroundColor: '#1A56DB', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12, elevation: 8,
  },
  homeBtnText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  anotherBtn: {
    width: '100%', backgroundColor: '#EEF2FF', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  anotherBtnText: { fontSize: 14, fontWeight: '700', color: '#1A56DB' },
});