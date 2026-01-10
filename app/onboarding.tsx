import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const personalities = [
  {
    id: 'A',
    title: 'Encouragement Seeker',
    icon: 'sunny-outline' as const,
    description: 'I need motivation and reassurance to stay on track',
    color: '#f59e0b',
  },
  {
    id: 'B',
    title: 'Creative Explorer',
    icon: 'color-palette-outline' as const,
    description: 'I like variety and creative approaches to fitness',
    color: '#8b5cf6',
  },
  {
    id: 'C',
    title: 'Goal Finisher',
    icon: 'trophy-outline' as const,
    description: 'I prefer structured plans and clear checklists',
    color: '#10b981',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmall = width < 375;
  const isLandscape = width > height;
  
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedPersonality) return;

    setLoading(true);
    try {
      const userId = `user_${Date.now()}`;
      
      const response = await fetch(`${API_URL}/user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, personality: selectedPersonality }),
      });

      if (response.ok) {
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('personality', selectedPersonality);
        router.replace('/chat');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hp = isSmall ? 16 : 20;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.headerNav, { paddingHorizontal: hp }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#a5b4fc" />
        </TouchableOpacity>
        <View style={styles.stepIndicator}>
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hp }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { marginBottom: isLandscape ? 16 : 24 }]}>
          <Text style={[styles.title, { fontSize: isSmall ? 24 : 28 }]}>Choose your style</Text>
          <Text style={[styles.subtitle, { fontSize: isSmall ? 14 : 15 }]}>This helps me personalize your fitness journey</Text>
        </View>

        <View style={styles.options}>
          {personalities.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.option,
                { padding: isSmall ? 14 : 16 },
                selectedPersonality === p.id && { borderColor: p.color, borderWidth: 2 },
              ]}
              onPress={() => setSelectedPersonality(p.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconBox, 
                { backgroundColor: `${p.color}15`, width: isSmall ? 48 : 52, height: isSmall ? 48 : 52 }
              ]}>
                <Ionicons name={p.icon} size={isSmall ? 24 : 26} color={p.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { fontSize: isSmall ? 15 : 16 }]}>{p.title}</Text>
                <Text style={[styles.optionDescription, { fontSize: isSmall ? 12 : 13 }]}>{p.description}</Text>
              </View>
              {selectedPersonality === p.id && (
                <View style={[styles.checkmark, { backgroundColor: p.color }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: hp }]}>
        <TouchableOpacity
          style={[styles.button, !selectedPersonality && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedPersonality || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d2d44',
  },
  stepDotActive: {
    backgroundColor: '#4f46e5',
    width: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
  },
  title: {
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9ca3af',
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  iconBox: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#9ca3af',
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: '#0f0f1a',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#4f46e550',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
