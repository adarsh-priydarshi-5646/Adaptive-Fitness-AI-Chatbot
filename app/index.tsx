import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="dumbbell" size={56} color="#4f46e5" />
          </View>
          <Text style={styles.title}>Fitness Companion</Text>
          <Text style={styles.subtitle}>Your AI-powered workout buddy</Text>
        </View>

        <View style={styles.featuresCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={20} color="#4f46e5" />
            <Text style={styles.cardTitle}>What I can help with</Text>
          </View>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="barbell-outline" size={22} color="#4ade80" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Workout Plans</Text>
                <Text style={styles.featureDesc}>Personalized routines for your goals</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="body-outline" size={22} color="#4ade80" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Exercise Guide</Text>
                <Text style={styles.featureDesc}>Proper form and techniques</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trending-up-outline" size={22} color="#4ade80" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Progress Tips</Text>
                <Text style={styles.featureDesc}>Stay motivated and consistent</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="heart-outline" size={22} color="#4ade80" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Wellness Advice</Text>
                <Text style={styles.featureDesc}>Recovery and lifestyle guidance</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <View style={styles.warningIconBox}>
              <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.warningTitle}>Important Notice</Text>
          </View>
          <Text style={styles.warningText}>
            This app provides general fitness guidance only. It does NOT provide medical advice. For health conditions, injuries, or medications, please consult a healthcare professional.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/onboarding')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4f46e520',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    letterSpacing: 0.2,
  },
  featuresCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4ade8015',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#9ca3af',
  },
  warningCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  warningIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f59e0b15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  warningText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
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
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
