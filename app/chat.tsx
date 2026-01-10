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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const quickActions = [
  { label: 'Beginner workout', icon: 'fitness-outline' as const },
  { label: 'Warm-up exercises', icon: 'flame-outline' as const },
  { label: 'Weekly plan', icon: 'calendar-outline' as const },
  { label: 'Recovery tips', icon: 'bed-outline' as const },
];

const parseAIResponse = (text: string) => {
  const sections: { type: string; content: string; items?: string[] }[] = [];
  const lines = text.split('\n');
  let currentSection: { type: string; content: string; items?: string[] } | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (/^(Day\s*\d+|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[:\s]/i.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'day', content: trimmed, items: [] };
    }
    else if (/^[-•*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      const item = trimmed.replace(/^[-•*\d.)]+\s*/, '');
      if (currentSection?.items) {
        currentSection.items.push(item);
      } else {
        if (currentSection) sections.push(currentSection);
        currentSection = { type: 'list', content: '', items: [item] };
      }
    }
    else if (/^(Want to know|Try asking|You might also|Suggested|Quick actions)[:\s]/i.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'followup', content: trimmed, items: [] };
    }
    else {
      if (currentSection?.type === 'list' || currentSection?.type === 'day') {
        if (currentSection.items) currentSection.items.push(trimmed);
      } else {
        if (currentSection) sections.push(currentSection);
        currentSection = { type: 'text', content: trimmed };
      }
    }
  }
  
  if (currentSection) sections.push(currentSection);
  return sections.length > 0 ? sections : [{ type: 'text', content: text }];
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
      const items = matches[1]?.split(/[|,]/).map(s => s.trim()).filter(Boolean);
      if (items) pills.push(...items);
    }
  }
  
  const pipeMatch = text.match(/([^|]+\|[^|]+(?:\|[^|]+)*)/);
  if (pipeMatch) {
    const items = pipeMatch[1].split('|').map(s => s.trim()).filter(Boolean);
    pills.push(...items);
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

  const renderStructuredContent = (text: string) => {
    const sections = parseAIResponse(text);
    
    return (
      <View>
        {sections.map((section, idx) => {
          if (section.type === 'day') {
            return (
              <View key={idx} style={styles.daySection}>
                <Text style={styles.dayHeader}>{section.content}</Text>
                {section.items?.map((item, i) => (
                  <View key={i} style={styles.dayItemRow}>
                    <Ionicons name="chevron-forward" size={14} color="#4ade80" />
                    <Text style={styles.dayItem}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          }
          if (section.type === 'list') {
            return (
              <View key={idx} style={styles.listSection}>
                {section.items?.map((item, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          }
          return (
            <Text key={idx} style={styles.messageText}>{section.content}</Text>
          );
        })}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="robot" size={16} color="#4f46e5" />
        </View>
      )}
      <View style={styles.messageContent}>
        {item.isUser ? (
          <Text style={[styles.messageText, styles.userText]}>{item.text}</Text>
        ) : (
          renderStructuredContent(item.text)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color="#a5b4fc" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="dumbbell" size={20} color="#4f46e5" />
          <Text style={styles.headerTitle}>Fitness Chat</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/history')} style={styles.headerButton}>
            <Ionicons name="time-outline" size={22} color="#a5b4fc" />
          </TouchableOpacity>
          <View style={styles.coinBadge}>
            <Ionicons name="star" size={14} color="#fbbf24" />
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4f46e5" size="small" />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      {followUpPills.length > 0 && !loading && (
        <View style={styles.followUpContainer}>
          {followUpPills.map((pill, index) => (
            <TouchableOpacity
              key={index}
              style={styles.followUpPill}
              onPress={() => sendMessage(pill)}
              activeOpacity={0.7}
            >
              <Text style={styles.followUpText}>{pill}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {messages.length === 1 && (
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={() => sendMessage(action.label)}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon} size={18} color="#a5b4fc" />
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about fitness..."
            placeholderTextColor="#6b7280"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  coinText: {
    color: '#fbbf24',
    fontWeight: '600',
    fontSize: 14,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageContent: {
    backgroundColor: '#2d2d44',
    padding: 14,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    flex: 1,
  },
  messageText: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  daySection: {
    marginVertical: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
  },
  dayHeader: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 2,
  },
  dayItem: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  listSection: {
    marginVertical: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
    marginTop: 8,
  },
  bulletText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  followUpContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  followUpPill: {
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  followUpText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4f46e5',
    gap: 8,
  },
  quickActionText: {
    color: '#a5b4fc',
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4f46e580',
  },
});
