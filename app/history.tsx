import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    setUserId(storedUserId);

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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderConversation = ({ item }: { item: ConversationItem }) => (
    <View style={styles.conversationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Day {item.usageDays}</Text>
        </View>
      </View>
      
      <View style={styles.messageRow}>
        <Text style={styles.label}>You:</Text>
        <Text style={styles.userMessage}>{truncateText(item.userMessage, 80)}</Text>
      </View>
      
      <View style={styles.messageRow}>
        <Text style={styles.label}>AI:</Text>
        <Text style={styles.aiMessage}>{truncateText(item.aiResponse, 120)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Start chatting to see your history here</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => router.push('/chat')}>
            <Text style={styles.startButtonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    color: '#a5b4fc',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  conversationCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  badge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  messageRow: {
    marginBottom: 8,
  },
  label: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  userMessage: {
    color: '#a5b4fc',
    fontSize: 14,
    lineHeight: 20,
  },
  aiMessage: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
});
