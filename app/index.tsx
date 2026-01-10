import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmall = width < 375;
  const isLandscape = width > height;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingHorizontal: isSmall ? 16 : 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { marginTop: isLandscape ? 8 : (isSmall ? 12 : 20) }]}>
          <View style={[styles.iconContainer, { 
            width: isSmall ? 80 : 100, 
            height: isSmall ? 80 : 100 
          }]}>
            <MaterialCommunityIcons name="dumbbell" size={isSmall ? 40 : 52} color="#4f46e5" />
          </View>
          <Text style={[styles.title, { fontSize: isSmall ? 24 : 30 }]}>Fitness Companion</Text>
          <Text style={[styles.subtitle, { fontSize: isSmall ? 14 : 16 }]}>Your AI-powered workout buddy</Text>
        </View>

        <View style={[styles.featuresCard, { padding: isSmall ? 16 : 20 }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={18} color="#4f46e5" />
            <Text style={[styles.cardTitle, { fontSize: isSmall ? 15 : 17 }]}>What I can help with</Text>
          </View>
          
          <View style={styles.featuresList}>
            {[
              { icon: 'barbell-outline', title: 'Workout Plans', desc: 'Personalized routines for your goals' },
              { icon: 'body-outline', title: 'Exercise Guide', desc: 'Proper form and techniques' },
              { icon: 'trending-up-outline', title: 'Progress Tips', desc: 'Stay motivated and consistent' },
              { icon: 'heart-outline', title: 'Wellness Advice', desc: 'Recovery and lifestyle guidance' },
            ].map((item, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={item.icon as any} size={20} color="#4ade80" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { fontSize: isSmall ? 14 : 15 }]}>{item.title}</Text>
                  <Text style={[styles.featureDesc, { fontSize: isSmall ? 12 : 13 }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.warningCard, { padding: isSmall ? 16 : 18 }]}>
          <View style={styles.warningHeader}>
            <Ionicons name="shield-checkmark" size={18} color="#f59e0b" />
            <Text style={[styles.warningTitle, { fontSize: isSmall ? 14 : 15 }]}>Important Notice</Text>
          </View>
          <Text style={[styles.warningText, { fontSize: isSmall ? 13 : 14 }]}>
            This app provides general fitness guidance only. It does NOT provide medical advice. For health conditions, injuries, or medications, please consult a healthcare professional.
          </Text>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: isSmall ? 16 : 20 }]}>
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
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    borderRadius: 50,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9ca3af',
  },
  featuresCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
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
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  featureDesc: {
    color: '#9ca3af',
  },
  warningCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
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
    fontWeight: '600',
    color: '#f59e0b',
  },
  warningText: {
    color: '#9ca3af',
    lineHeight: 22,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  versionText: {
    color: '#6b7280',
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingBottom: 56,
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
