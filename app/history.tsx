import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type ConversationItem = {
  _id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
  personality: string;
  usageDays: number;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');

    if (storedUserId) {
      try {
        const response = await fetch(`${API_URL}/chat/history/${storedUserId}?limit=10`);
        const data = await response.json();
        if (data.conversations) {
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateText = (text: string, maxLength: number) => {
    const cleanText = text.replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  const renderConversation = ({ item }: { item: ConversationItem }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        <View style={styles.dayBadge}>
          <Text style={styles.dayText}>Day {item.usageDays}</Text>
        </View>
      </View>
      
      <View style={styles.messageBlock}>
        <View style={styles.userRow}>
          <Ionicons name="person-circle" size={20} color="#a5b4fc" />
          <Text style={styles.userMsg}>{truncateText(item.userMessage, 80)}</Text>
        </View>
        <View style={styles.aiRow}>
          <MaterialCommunityIcons name="robot-happy" size={20} color="#4ade80" />
          <Text style={styles.aiMsg}>{truncateText(item.aiResponse, 100)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#a5b4fc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={48} color="#4f46e5" />
          </View>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyDesc}>Start chatting to see your history here</Text>
          <TouchableOpacity 
            style={styles.startBtn} 
            onPress={() => router.push('/chat')}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{conversations.length}</Text>
              <Text style={styles.statLabel}>Chats</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{conversations[0]?.usageDays || 1}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '600',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    marginHorizontal: isSmallDevice ? 12 : 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4f46e5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2d2d44',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    padding: isSmallDevice ? 12 : 16,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  timestamp: {
    color: '#6b7280',
    fontSize: 13,
  },
  dayBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  messageBlock: {
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  userMsg: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  aiMsg: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
