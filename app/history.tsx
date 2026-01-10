import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  const { width, height } = useWindowDimensions();
  const isSmall = width < 375;
  const isLandscape = width > height;
  
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

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

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all chat history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            const storedUserId = await AsyncStorage.getItem('userId');
            if (storedUserId) {
              try {
                await fetch(`${API_URL}/chat/history/${storedUserId}`, {
                  method: 'DELETE',
                });
                setConversations([]);
              } catch (error) {
                console.error('Error clearing history:', error);
              }
            }
            setClearing(false);
          },
        },
      ]
    );
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

  const hp = isSmall ? 12 : 16;

  const renderConversation = ({ item }: { item: ConversationItem }) => (
    <View style={[styles.card, { padding: isSmall ? 14 : 16 }]}>
      <View style={styles.cardTop}>
        <Text style={[styles.timestamp, { fontSize: isSmall ? 12 : 13 }]}>{formatDate(item.timestamp)}</Text>
        <View style={styles.dayBadge}>
          <Text style={styles.dayText}>Day {item.usageDays}</Text>
        </View>
      </View>
      
      <View style={styles.messageBlock}>
        <View style={styles.msgRow}>
          <Ionicons name="person-circle" size={isSmall ? 18 : 20} color="#a5b4fc" />
          <Text style={[styles.userMsg, { fontSize: isSmall ? 13 : 14 }]}>
            {truncateText(item.userMessage, isLandscape ? 120 : 80)}
          </Text>
        </View>
        <View style={styles.msgRow}>
          <MaterialCommunityIcons name="robot-happy" size={isSmall ? 18 : 20} color="#4ade80" />
          <Text style={[styles.aiMsg, { fontSize: isSmall ? 13 : 14 }]}>
            {truncateText(item.aiResponse, isLandscape ? 150 : 100)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: hp }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={20} color="#a5b4fc" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: isSmall ? 16 : 17 }]}>Chat History</Text>
        {conversations.length > 0 ? (
          <TouchableOpacity onPress={clearHistory} style={styles.clearBtn} disabled={clearing}>
            {clearing ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={[styles.emptyIcon, { width: isSmall ? 80 : 100, height: isSmall ? 80 : 100 }]}>
            <Ionicons name="chatbubbles-outline" size={isSmall ? 40 : 48} color="#4f46e5" />
          </View>
          <Text style={[styles.emptyTitle, { fontSize: isSmall ? 18 : 20 }]}>No conversations yet</Text>
          <Text style={[styles.emptyDesc, { fontSize: isSmall ? 13 : 14 }]}>Start chatting to see your history here</Text>
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
          <View style={[styles.statsRow, { marginHorizontal: hp }]}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { fontSize: isSmall ? 20 : 22 }]}>{conversations.length}</Text>
              <Text style={styles.statLabel}>Chats</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, { fontSize: isSmall ? 20 : 22 }]}>{conversations[0]?.usageDays || 1}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[styles.list, { padding: hp }]}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#fff',
  },
  clearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
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
    borderRadius: 50,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDesc: {
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
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
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
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  userMsg: {
    color: '#e5e7eb',
    lineHeight: 20,
    flex: 1,
  },
  aiMsg: {
    color: '#9ca3af',
    lineHeight: 20,
    flex: 1,
  },
});
