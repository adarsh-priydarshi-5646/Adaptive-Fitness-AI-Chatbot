import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
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
    traits: ['Supportive tone', 'Frequent encouragement', 'Gentle reminders'],
    color: '#f59e0b',
    bgColor: '#f59e0b15',
  },
  {
    id: 'B',
    title: 'Creative Explorer',
    icon: 'color-palette-outline' as const,
    description: 'I like variety and creative approaches to fitness',
    traits: ['Diverse options', 'Fun variations', 'Flexible plans'],
    color: '#8b5cf6',
    bgColor: '#8b5cf615',
  },
  {
    id: 'C',
    title: 'Goal Finisher',
    icon: 'trophy-outline' as const,
    description: 'I prefer structured plans and clear checklists',
    traits: ['Clear steps', 'Progress tracking', 'Direct advice'],
    color: '#10b981',
    bgColor: '#10b98115',
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

  const selectedData = personalities.find(p => p.id === selectedPersonality);

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
        <View style={{ width: 44 }} />
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
              <View style={styles.optionTop}>
                <View style={[styles.iconBox, { backgroundColor: p.bgColor }]}>
                  <Ionicons name={p.icon} size={28} color={p.color} />
                </View>
                {selectedPersonality === p.id && (
                  <View style={[styles.checkmark, { backgroundColor: p.color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
              
              <Text style={styles.optionTitle}>{p.title}</Text>
              <Text style={styles.optionDescription}>{p.description}</Text>
              
              <View style={styles.traitsRow}>
                {p.traits.map((trait, idx) => (
                  <View key={idx} style={[styles.traitBadge, { backgroundColor: p.bgColor }]}>
                    <Text style={[styles.traitText, { color: p.color }]}>{trait}</Text>
                  </View>
                ))}
              </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d2d44',
  },
  stepDotActive: {
    backgroundColor: '#4f46e5',
    width: 24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  options: {
    gap: 16,
  },
  option: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 16,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#0f0f1a',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: '#4f46e550',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
