import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const personalities = [
  {
    id: 'A',
    title: 'Encouragement Seeker',
    emoji: '🌟',
    description: 'I need motivation and reassurance to stay on track',
    color: '#f59e0b',
  },
  {
    id: 'B',
    title: 'Creative Explorer',
    emoji: '🎨',
    description: 'I like variety and creative approaches to fitness',
    color: '#8b5cf6',
  },
  {
    id: 'C',
    title: 'Goal Finisher',
    emoji: '🎯',
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
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          >
            <Text style={styles.optionEmoji}>{p.emoji}</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{p.title}</Text>
              <Text style={styles.optionDescription}>{p.description}</Text>
            </View>
            {selectedPersonality === p.id && (
              <View style={[styles.checkmark, { backgroundColor: p.color }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, !selectedPersonality && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!selectedPersonality || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
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
  },
  optionEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
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
