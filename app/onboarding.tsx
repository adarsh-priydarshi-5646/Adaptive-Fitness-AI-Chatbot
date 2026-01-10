import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerNav}>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose your style</Text>
          <Text style={styles.subtitle}>This helps me personalize your fitness journey</Text>
        </View>

        <View style={styles.options}>
          {personalities.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.option,
                selectedPersonality === p.id && { borderColor: p.color, borderWidth: 2 },
              ]}
              onPress={() => setSelectedPersonality(p.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: `${p.color}15` }]}>
                <Ionicons name={p.icon} size={26} color={p.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{p.title}</Text>
                <Text style={styles.optionDescription}>{p.description}</Text>
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

      <View style={styles.footer}>
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
    paddingHorizontal: isSmallDevice ? 16 : 20,
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
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 15,
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
    padding: isSmallDevice ? 14 : 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  iconBox: {
    width: isSmallDevice ? 48 : 52,
    height: isSmallDevice ? 48 : 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: isSmallDevice ? 12 : 13,
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
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: 16,
    paddingBottom: 24,
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
