import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const quickActions = [
  { label: 'Beginner workout', icon: 'fitness-outline' as const },
  { label: 'Warm-up routine', icon: 'flame-outline' as const },
  { label: 'Weekly plan', icon: 'calendar-outline' as const },
  { label: 'Recovery tips', icon: 'leaf-outline' as const },
];

const formatAIText = (text: string) => {
  let formatted = text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,3}\s*/g, '')
    .trim();
  return formatted;
};

const parseAIResponse = (text: string) => {
  const cleanText = formatAIText(text);
  const lines = cleanText.split('\n');
  const elements: { type: string; content: string; level?: number }[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push({ type: 'space', content: '' });
      continue;
    }
    
    if (/^(Day\s*\d+|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[:\s-]/i.test(trimmed)) {
      elements.push({ type: 'dayHeader', content: trimmed });
    }
    else if (/^(Want to know|Try asking|You might also)/i.test(trimmed)) {
      continue;
    }
    else if (/^\d+[.)]\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+[.)]\s*/, '');
      elements.push({ type: 'numbered', content, level: 1 });
    }
    else if (/^[-•]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-•]\s*/, '');
      elements.push({ type: 'bullet', content });
    }
    else if (/^\t[-•]\s/.test(trimmed) || /^\s{2,}[-•]\s/.test(trimmed)) {
      const content = trimmed.replace(/^\s*[-•]\s*/, '');
      elements.push({ type: 'subBullet', content });
    }
    else {
      elements.push({ type: 'text', content: trimmed });
    }
  }
  
  return elements;
};

const extractFollowUpPills = (text: string): string[] => {
  const pills: string[] = [];
  const patterns = [
    /Want to know about[:\s]*(.+)/i,
    /Try asking[:\s]*(.+)/i,
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      const items = matches[1]?.split(/[|,]/).map(s => s.trim().replace(/\*\*/g, '')).filter(Boolean);
      if (items) pills.push(...items);
    }
  }
  
  return Array.from(new Set(pills)).slice(0, 3);
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [followUpPills, setFollowUpPills] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    setUserId(storedUserId);
    
    if (storedUserId) {
      try {
        const response = await fetch(`${API_URL}/user/${storedUserId}`);
        const data = await response.json();
        if (data.user) {
          setCoins(data.user.coins);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }

    setMessages([{
      id: '1',
      text: "Hey! I'm your fitness companion. Ask me anything about workouts, exercises, or wellness tips!",
      isUser: false,
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !userId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setFollowUpPills([]);

    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: text.trim() }),
      });

      const data = await response.json();
      const responseText = data.response || data.error || 'Sorry, something went wrong.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      if (data.coins) setCoins(data.coins);
      const pills = extractFollowUpPills(responseText);
      setFollowUpPills(pills);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Unable to connect to server. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderAIContent = (text: string) => {
    const elements = parseAIResponse(text);
    
    return (
      <View style={styles.aiContent}>
        {elements.map((el, idx) => {
          if (el.type === 'space') {
            return <View key={idx} style={styles.spacer} />;
          }
          if (el.type === 'dayHeader') {
            return (
              <Text key={idx} style={styles.dayHeader}>{el.content}</Text>
            );
          }
          if (el.type === 'numbered') {
            return (
              <View key={idx} style={styles.numberedItem}>
                <Text style={styles.numberedText}>{el.content}</Text>
              </View>
            );
          }
          if (el.type === 'bullet') {
            return (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{el.content}</Text>
              </View>
            );
          }
          if (el.type === 'subBullet') {
            return (
              <View key={idx} style={styles.subBulletItem}>
                <Text style={styles.subBulletDot}>◦</Text>
                <Text style={styles.subBulletText}>{el.content}</Text>
              </View>
            );
          }
          return (
            <Text key={idx} style={styles.aiText}>{el.content}</Text>
          );
        })}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.isUser && styles.userMessageRow]}>
      {!item.isUser && (
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="robot-happy" size={18} color="#4f46e5" />
        </View>
      )}
      <View style={[styles.messageContent, item.isUser && styles.userMessageContent]}>
        {item.isUser ? (
          <Text style={styles.userText}>{item.text}</Text>
        ) : (
          renderAIContent(item.text)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={20} color="#a5b4fc" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="dumbbell" size={20} color="#4f46e5" />
          <Text style={styles.headerTitle}>Fitness Chat</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/history')} style={styles.headerBtn}>
            <Ionicons name="time-outline" size={20} color="#a5b4fc" />
          </TouchableOpacity>
          <View style={styles.coinBadge}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.coinText}>{coins}</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="robot-happy" size={18} color="#4f46e5" />
          </View>
          <View style={styles.loadingBubble}>
            <ActivityIndicator color="#4f46e5" size="small" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        </View>
      )}

      {followUpPills.length > 0 && !loading && (
        <View style={styles.pillsContainer}>
          {followUpPills.map((pill, index) => (
            <TouchableOpacity
              key={index}
              style={styles.pill}
              onPress={() => sendMessage(pill)}
              activeOpacity={0.7}
            >
              <Text style={styles.pillText}>{pill}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {messages.length === 1 && (
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickBtn}
              onPress={() => sendMessage(action.label)}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon} size={16} color="#4f46e5" />
              <Text style={styles.quickBtnText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about fitness..."
            placeholderTextColor="#6b7280"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  coinText: {
    color: '#fbbf24',
    fontWeight: '600',
    fontSize: 13,
  },
  messageList: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    flex: 1,
    maxWidth: '85%',
  },
  userMessageContent: {
    backgroundColor: '#4f46e5',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  aiContent: {
    paddingTop: 4,
  },
  aiText: {
    color: '#e5e7eb',
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 22,
  },
  spacer: {
    height: 12,
  },
  dayHeader: {
    color: '#4f46e5',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  numberedItem: {
    marginVertical: 4,
    paddingLeft: 4,
  },
  numberedText: {
    color: '#e5e7eb',
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    marginVertical: 3,
    paddingLeft: 4,
  },
  bulletDot: {
    color: '#4ade80',
    fontSize: 16,
    marginRight: 10,
    lineHeight: 24,
  },
  bulletText: {
    color: '#e5e7eb',
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
    flex: 1,
  },
  subBulletItem: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingLeft: 20,
  },
  subBulletDot: {
    color: '#9ca3af',
    fontSize: 14,
    marginRight: 8,
    lineHeight: 22,
  },
  subBulletText: {
    color: '#d1d5db',
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 22,
    flex: 1,
  },
  loadingRow: {
    flexDirection: 'row',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingBottom: 12,
    gap: 10,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingBottom: 12,
    gap: 8,
  },
  pill: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4ade8040',
  },
  pillText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingBottom: 12,
    gap: 8,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
  },
  quickBtnText: {
    color: '#a5b4fc',
    fontSize: 13,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#4f46e5',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#4f46e540',
  },
});
