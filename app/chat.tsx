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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const quickActions = [
  '💪 Beginner workout',
  '🔥 Warm-up exercises',
  '📅 Weekly plan',
  '😴 Recovery tips',
];

// Parse AI response for structured content
const parseAIResponse = (text: string) => {
  const sections: { type: string; content: string; items?: string[] }[] = [];
  const lines = text.split('\n');
  let currentSection: { type: string; content: string; items?: string[] } | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for day headers (Day 1:, Monday:, etc.)
    if (/^(Day\s*\d+|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[:\s]/i.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'day', content: trimmed, items: [] };
    }
    // Check for bullet points
    else if (/^[-•*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      const item = trimmed.replace(/^[-•*\d.)]+\s*/, '');
      if (currentSection?.items) {
        currentSection.items.push(item);
      } else {
        if (currentSection) sections.push(currentSection);
        currentSection = { type: 'list', content: '', items: [item] };
      }
    }
    // Check for follow-up suggestions (Want to know about:, etc.)
    else if (/^(Want to know|Try asking|You might also|Suggested|Quick actions)[:\s]/i.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'followup', content: trimmed, items: [] };
    }
    // Regular text
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

// Extract follow-up pills from response
const extractFollowUpPills = (text: string): string[] => {
  const pills: string[] = [];
  const patterns = [
    /Want to know about[:\s]*(.+)/i,
    /Try asking[:\s]*(.+)/i,
    /\|([^|]+)\|/g,
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      const items = matches[1]?.split(/[|,]/).map(s => s.trim()).filter(Boolean);
      if (items) pills.push(...items);
    }
  }
  
  // Also check for pipe-separated suggestions
  const pipeMatch = text.match(/([^|]+\|[^|]+(?:\|[^|]+)*)/);
  if (pipeMatch) {
    const items = pipeMatch[1].split('|').map(s => s.trim()).filter(Boolean);
    pills.push(...items);
  }
  
  return Array.from(new Set(pills)).slice(0, 3);
};

export default function ChatScreen() {
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
      text: "Hey! 👋 I'm your fitness companion. Ask me anything about workouts, exercises, or wellness tips!",
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
      
      // Extract follow-up pills
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

  // Render structured AI response
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
                  <Text key={i} style={styles.dayItem}>• {item}</Text>
                ))}
              </View>
            );
          }
          if (section.type === 'list') {
            return (
              <View key={idx} style={styles.listSection}>
                {section.items?.map((item, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
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
      {item.isUser ? (
        <Text style={[styles.messageText, styles.userText]}>{item.text}</Text>
      ) : (
        renderStructuredContent(item.text)
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💪 Fitness Chat</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>🪙 {coins}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4f46e5" />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      {/* Follow-up action pills */}
      {followUpPills.length > 0 && !loading && (
        <View style={styles.followUpContainer}>
          {followUpPills.map((pill, index) => (
            <TouchableOpacity
              key={index}
              style={styles.followUpPill}
              onPress={() => sendMessage(pill)}
            >
              <Text style={styles.followUpText}>{pill}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Initial quick actions */}
      {messages.length === 1 && (
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={() => sendMessage(action)}
            >
              <Text style={styles.quickActionText}>{action}</Text>
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
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>↑</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  coinBadge: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinText: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#2d2d44',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  // Structured response styles
  daySection: {
    marginVertical: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 10,
  },
  dayHeader: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  dayItem: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  listSection: {
    marginVertical: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  bulletDot: {
    color: '#4ade80',
    fontSize: 14,
    marginRight: 8,
    width: 12,
  },
  bulletText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#888',
    marginLeft: 8,
  },
  // Follow-up pills
  followUpContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  followUpPill: {
    backgroundColor: '#16213e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  followUpText: {
    color: '#4ade80',
    fontSize: 13,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  quickActionText: {
    color: '#a5b4fc',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#4f46e580',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
