import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const personalities = [
  {
    id: 'A',
    title: 'Encouragement Seeker',
    icon: 'star-outline' as const,
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
    icon: 'flag-outline' as const,
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
          <Ionicons name="arrow-back" size={24} color="#a5b4fc" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>What describes you best?</Text>
        <Text style={styles.subtitle}>This helps me personalize your experience</Text>
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
            <View style={[styles.iconBox, { backgroundColor: `${p.color}20` }]}>
              <Ionicons name={p.icon} size={28} color={p.color} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{p.title}</Text>
              <Text style={styles.optionDescription}>{p.description}</Text>
            </View>
            {selectedPersonality === p.id && (
              <View style={[styles.checkmark, { backgroundColor: p.color }]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24,
  },
  headerNav: {
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  options: {
    flex: 1,
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#4f46e580',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
