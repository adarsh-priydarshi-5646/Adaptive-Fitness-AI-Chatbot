import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

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
            <MaterialCommunityIcons name="dumbbell" size={isSmallDevice ? 44 : 52} color="#4f46e5" />
          </View>
          <Text style={styles.title}>Fitness Companion</Text>
          <Text style={styles.subtitle}>Your AI-powered workout buddy</Text>
        </View>

        <View style={styles.featuresCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={18} color="#4f46e5" />
            <Text style={styles.cardTitle}>What I can help with</Text>
          </View>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="barbell-outline" size={20} color="#4ade80" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Workout Plans</Text>
                <Text style={styles.featureDesc}>Personalized routines for your goals</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="body-outline" size={20} color="#4ade80" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Exercise Guide</Text>
                <Text style={styles.featureDesc}>Proper form and techniques</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="trending-up-outline" size={20} color="#4ade80" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Progress Tips</Text>
                <Text style={styles.featureDesc}>Stay motivated and consistent</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="heart-outline" size={20} color="#4ade80" />
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
            <Ionicons name="shield-checkmark" size={18} color="#f59e0b" />
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
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 12 : 20,
    marginBottom: isSmallDevice ? 28 : 36,
  },
  iconContainer: {
    width: isSmallDevice ? 88 : 100,
    height: isSmallDevice ? 88 : 100,
    borderRadius: 50,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#9ca3af',
  },
  featuresCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: isSmallDevice ? 16 : 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  featuresList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#4ade8015',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#9ca3af',
  },
  warningCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: isSmallDevice ? 16 : 18,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: '#f59e0b',
  },
  warningText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#9ca3af',
    lineHeight: 22,
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
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
