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
  { label: 'Warm-up routine', icon: 'flame-outline' as const },
  { label: 'Weekly plan', icon: 'calendar-outline' as const },
  { label: 'Recovery tips', icon: 'leaf-outline' as const },
];

const parseAIResponse = (text: string) => {
  const sections: { type: string; content: string; items?: string[] }[] = [];
  const lines = text.split('\n');
  let currentSection: { type: string; content: string; items?: string[] } | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (/^(\*\*)?Day\s*\d+/i.test(trimmed) || /^(\*\*)?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'day', content: trimmed.replace(/\*\*/g, ''), items: [] };
    }
    else if (/^[-•*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      const item = trimmed.replace(/^[-•*\d.)]+\s*/, '').replace(/\*\*/g, '');
      if (currentSection?.items) {
        currentSection.items.push(item);
      } else {
        if (currentSection) sections.push(currentSection);
        currentSection = { type: 'list', content: '', items: [item] };
      }
    }
    else if (/^(\*\*)?(Want to know|Try asking|You might also|Suggested|Quick actions)/i.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'followup', content: trimmed.replace(/\*\*/g, ''), items: [] };
    }
    else if (/^\*\*[^*]+\*\*/.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'heading', content: trimmed.replace(/\*\*/g, '') };
    }
    else {
      const cleanText = trimmed.replace(/\*\*/g, '');
      if (currentSection?.type === 'list' || currentSection?.type === 'day') {
        if (currentSection.items && cleanText.length > 0) currentSection.items.push(cleanText);
      } else {
        if (currentSection) sections.push(currentSection);
        currentSection = { type: 'text', content: cleanText };
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

  const renderStructuredContent = (text: string) => {
    const sections = parseAIResponse(text);
    
    return (
      <View style={styles.structuredContent}>
        {sections.map((section, idx) => {
          if (section.type === 'heading') {
            return (
              <View key={idx} style={styles.headingSection}>
                <Text style={styles.headingText}>{section.content}</Text>
              </View>
            );
          }
          if (section.type === 'day') {
            return (
              <View key={idx} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Ionicons name="calendar" size={16} color="#4f46e5" />
                  <Text style={styles.dayTitle}>{section.content}</Text>
                </View>
                <View style={styles.dayItems}>
                  {section.items?.map((item, i) => (
                    <View key={i} style={styles.dayItemRow}>
                      <View style={styles.dayItemDot} />
                      <Text style={styles.dayItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          }
          if (section.type === 'list') {
            return (
              <View key={idx} style={styles.listContainer}>
                {section.items?.map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={styles.listBullet}>
                      <Ionicons name="checkmark" size={12} color="#4ade80" />
                    </View>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          }
          if (section.type === 'followup') {
            return null;
          }
          return (
            <Text key={idx} style={styles.messageText}>{section.content}</Text>
          );
        })}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageWrapper, item.isUser && styles.userMessageWrapper]}>
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="robot-happy" size={18} color="#4f46e5" />
        </View>
      )}
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        {item.isUser ? (
          <Text style={styles.userText}>{item.text}</Text>
        ) : (
          renderStructuredContent(item.text)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color="#a5b4fc" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="dumbbell" size={22} color="#4f46e5" />
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
          <View style={styles.loadingBubble}>
            <ActivityIndicator color="#4f46e5" size="small" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        </View>
      )}

      {followUpPills.length > 0 && !loading && (
        <View style={styles.followUpContainer}>
          <Text style={styles.followUpLabel}>Quick follow-ups</Text>
          <View style={styles.followUpRow}>
            {followUpPills.map((pill, index) => (
              <TouchableOpacity
                key={index}
                style={styles.followUpPill}
                onPress={() => sendMessage(pill)}
                activeOpacity={0.7}
              >
                <Text style={styles.followUpText}>{pill}</Text>
                <Ionicons name="arrow-forward" size={14} color="#4ade80" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {messages.length === 1 && (
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsLabel}>Try asking about</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionButton}
                onPress={() => sendMessage(action.label)}
                activeOpacity={0.7}
              >
                <Ionicons name={action.icon} size={20} color="#4f46e5" />
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about fitness..."
              placeholderTextColor="#6b7280"
              multiline
            />
          </View>
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
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f0f1a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
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
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderBottomLeftRadius: 6,
  },
  structuredContent: {
    gap: 12,
  },
  messageText: {
    color: '#e5e7eb',
    fontSize: 15,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 24,
  },
  headingSection: {
    marginBottom: 4,
  },
  headingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  dayCard: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4f46e5',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dayTitle: {
    color: '#4f46e5',
    fontSize: 15,
    fontWeight: '600',
  },
  dayItems: {
    gap: 8,
  },
  dayItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dayItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
    marginTop: 8,
  },
  dayItemText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ade8020',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  listText: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 10,
    marginLeft: 42,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  followUpContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f0f1a',
  },
  followUpLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  followUpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  followUpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ade8040',
    gap: 8,
  },
  followUpText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '500',
  },
  quickActions: {
    padding: 16,
    backgroundColor: '#0f0f1a',
  },
  quickActionsLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4f46e530',
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
    backgroundColor: '#0f0f1a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4f46e540',
  },
});
