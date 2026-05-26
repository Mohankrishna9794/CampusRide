import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🚗',
    title: 'Find a Ride',
    subtitle: 'Browse rides posted by verified students going your way every day',
    color: '#1A56DB',
  },
  {
    id: '2',
    emoji: '🏍️',
    title: 'Host a Ride',
    subtitle: 'Share your vehicle, split the fuel cost and help fellow students commute',
    color: '#2563EB',
  },
  {
    id: '3',
    emoji: '🛡️',
    title: 'Travel Safe',
    subtitle: 'Every rider is college verified. Ride only with trusted students from your campus',
    color: '#1D4ED8',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/login');
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const skip = () => router.replace('/login');

  return (
    <View style={styles.container}>

      {/* Top bar with back and skip */}
      <View style={styles.topBar}>
        {currentIndex > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
        <TouchableOpacity style={styles.skipBtn} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.emojiCard, { backgroundColor: item.color }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[
            styles.dot,
            {
              width: i === currentIndex ? 24 : 8,
              backgroundColor: i === currentIndex ? '#1A56DB' : '#1A56DB30',
            }
          ]} />
        ))}
      </View>

      {/* Next / Get Started button */}
      <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
        <Text style={styles.nextText}>
          {currentIndex === slides.length - 1 ? 'Get Started 🚀' : 'Next →'}
        </Text>
      </TouchableOpacity>

      {/* Login link */}
      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.loginLink}>
          Already have an account?{' '}
          <Text style={styles.loginLinkBlue}>Login</Text>
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingBottom: 48,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A56DB10',
  },
  backText: {
    fontSize: 13,
    color: '#1A56DB',
    fontWeight: '700',
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A56DB10',
  },
  skipText: {
    fontSize: 13,
    color: '#1A56DB',
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emojiCard: {
    width: 220,
    height: 220,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  emoji: {
    fontSize: 100,
    zIndex: 2,
  },
  decorCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#ffffff15',
    top: -40,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff10',
    bottom: -20,
    left: -20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0A0F2E',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    width: width - 48,
    backgroundColor: '#1A56DB',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loginLink: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  loginLinkBlue: {
    color: '#1A56DB',
    fontWeight: '800',
  },
});