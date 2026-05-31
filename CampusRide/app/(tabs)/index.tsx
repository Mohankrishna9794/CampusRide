import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Route based on the restored session: logged-in users skip onboarding/login.
    // We wait for BOTH the splash animation (min 3.5s) AND Firebase to resolve
    // the persisted session before navigating.
    let didNavigate = false;
    let authReady = false;
    let isAuthed = false;
    let minTimePassed = false;

    const go = () => {
      if (didNavigate || !authReady || !minTimePassed) return;
      didNavigate = true;
      router.replace((isAuthed ? '/home' : '/onboarding') as any);
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      authReady = true;
      isAuthed = !!user;
      go();
    });

    const timer = setTimeout(() => { minTimePassed = true; go(); }, 3500);

    return () => { clearTimeout(timer); unsubAuth(); };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F2E" />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

      <Animated.View style={[styles.logoCard, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }]}>
        <View style={styles.logoInner}>
          <Text style={styles.cursive}>CR</Text>
        </View>
        <View style={[styles.corner, { top: -4, right: -4 }]} />
        <View style={[styles.corner, { bottom: -4, left: -4 }]} />
      </Animated.View>

      <Animated.View style={{
        opacity: textFade,
        transform: [{ translateY: textSlide }],
        alignItems: 'center',
      }}>
        <Text style={styles.appName}>
          Campus<Text style={styles.appNameBlue}>Ride</Text>
        </Text>
        <Text style={styles.tagline}>Ride Together · Save Together</Text>
        <View style={styles.pillsRow}>
          {['🔒 Verified', '⚡ Instant', '🌿 Eco'].map((p, i) => (
            <View key={i} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.dotsRow, { opacity: textFade }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[
            styles.dot,
            { backgroundColor: i === 1 ? '#4A90E2' : '#ffffff30' }
          ]} />
        ))}
      </Animated.View>

      <Animated.Text style={[styles.bottomText, { opacity: textFade }]}>
        STUDENT CARPOOLING PLATFORM
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F2E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: '#1A56DB08',
    top: -200,
    right: -150,
    borderWidth: 1,
    borderColor: '#1A56DB15',
  },
  bgCircle2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#1A56DB08',
    bottom: -120,
    left: -100,
    borderWidth: 1,
    borderColor: '#1A56DB15',
  },
  bgCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4A90E210',
    top: height * 0.4,
    right: -60,
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#1A56DB20',
  },
  logoCard: {
    width: 160,
    height: 160,
    borderRadius: 44,
    backgroundColor: '#1A56DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 30,
    position: 'relative',
  },
  logoInner: {
    width: 120,
    height: 120,
    borderRadius: 34,
    backgroundColor: '#1E63F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff20',
  },
  cursive: {
    fontSize: 72,
    color: '#ffffff',
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: -4,
  },
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 8,
  },
  appNameBlue: {
    color: '#4A90E2',
  },
  tagline: {
    fontSize: 13,
    color: '#ffffff60',
    letterSpacing: 1.5,
    marginBottom: 24,
    fontWeight: '500',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff10',
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  pillText: {
    fontSize: 11,
    color: '#ffffff90',
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomText: {
    position: 'absolute',
    bottom: 44,
    fontSize: 10,
    color: '#ffffff30',
    letterSpacing: 3,
    fontWeight: '600',
  },
});