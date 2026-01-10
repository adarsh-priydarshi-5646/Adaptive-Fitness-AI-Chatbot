import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config/api';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isTyping?: boolean;
};

const quickActions = [
  { label: 'Beginner workout', icon: 'fitness-outline' as const },
  { label: 'Warm-up routine', icon: 'flame-outline' as const },
  { label: 'Weekly plan', icon: 'calendar-outline' as const },
  { label: 'Recovery tips', icon: 'leaf-outline' as const },
];

const FormattedText = ({ text, isSmall }: { text: string; isSmall: boolean }) => {
  const fontSize = isSmall ? 14 : 15;
  const lines = text.split('\n');
  
  return (
    <View style={styles.formattedContainer}>
      {lines.map((line, lineIndex) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          const headingText = trimmedLine.slice(2, -2);
          return (
            <Text key={lineIndex} style={[styles.heading, { fontSize: fontSize + 1 }]}>
              {headingText}
            </Text>
          );
        }
        
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          const bulletText = trimmedLine.slice(2);
          return (
            <View key={lineIndex} style={styles.bulletRow}>
              <Text style={[styles.bullet, { fontSize }]}>•</Text>
              <Text style={[styles.bulletText, { fontSize }]}>
                {renderInlineFormatting(bulletText)}
              </Text>
            </View>
          );
        }
        
        if (/^\d+\.\s/.test(trimmedLine)) {
          const match = trimmedLine.match(/^(\d+\.)\s(.*)$/);
          if (match) {
            return (
              <View key={lineIndex} style={styles.numberedRow}>
                <Text style={[styles.numberText, { fontSize }]}>{match[1]}</Text>
                <Text style={[styles.bulletText, { fontSize }]}>
                  {renderInlineFormatting(match[2])}
                </Text>
              </View>
            );
          }
        }
        
        if (trimmedLine === '') {
          return <View key={lineIndex} style={styles.spacer} />;
        }
        
        return (
          <Text key={lineIndex} style={[styles.paragraph, { fontSize }]}>
            {renderInlineFormatting(trimmedLine)}
          </Text>
        );
      })}
    </View>
  );
};

const renderInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
};

export default function ChatScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmall = width < 375;
  const isLandscape = width > height;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUserData();
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
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
    }]);
  };

  const typeText = (messageId: string, fullText: string, currentIndex: number) => {
    if (currentIndex <= fullText.length) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, text: fullText.slice(0, currentIndex), isTyping: currentIndex < fullText.length }
            : msg
        )
      );
      
      if (currentIndex < fullText.length) {
        const char = fullText[currentIndex];
        let delay = 8;
        if (char === '\n') delay = 50;
        else if (char === '.' || char === '!' || char === '?') delay = 80;
        else if (char === ',') delay = 40;
        
        typingRef.current = setTimeout(() => {
          typeText(messageId, fullText, currentIndex + 1);
        }, delay);
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !userId || loading) return;

    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: '',
      isUser: false,
      isTyping: true,
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: text.trim() }),
      });

      const data = await response.json();
      
      if (data.response) {
        setCoins(data.coins || coins);
        typeText(aiMessageId, data.response, 0);
      }
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: 'Unable to connect. Please try again.', isTyping: false }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.isUser && styles.userMessageRow]}>
      {!item.isUser && (
        <View style={[styles.avatar, { width: isSmall ? 28 : 32, height: isSmall ? 28 : 32 }]}>
          <MaterialCommunityIcons name="robot-happy" size={isSmall ? 16 : 18} color="#4f46e5" />
        </View>
      )}
      <View style={[
        styles.messageContent, 
        item.isUser && styles.userBubble,
        { maxWidth: isLandscape ? '60%' : '85%' }
      ]}>
        {item.isUser ? (
          <Text style={[styles.userText, { fontSize: isSmall ? 14 : 15 }]}>{item.text}</Text>
        ) : item.text === '' && item.isTyping ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text style={[styles.thinkingText, { marginLeft: 8 }]}>Thinking...</Text>
          </View>
        ) : (
          <View>
            <FormattedText text={item.text} isSmall={isSmall} />
            {item.isTyping && <Text style={styles.cursor}>▊</Text>}
          </View>
        )}
      </View>
    </View>
  );

  const hp = isSmall ? 12 : 16;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: hp }]}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={20} color="#a5b4fc" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MaterialCommunityIcons name="dumbbell" size={isSmall ? 18 : 20} color="#4f46e5" />
          <Text style={[styles.headerTitle, { fontSize: isSmall ? 15 : 17 }]}>Fitness Chat</Text>
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
        contentContainerStyle={[styles.messageList, { paddingHorizontal: hp }]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {messages.length === 1 && (
        <View style={[styles.quickActions, { paddingHorizontal: hp }]}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickBtn, isSmall && { paddingHorizontal: 10, paddingVertical: 8 }]}
              onPress={() => sendMessage(action.label)}
              activeOpacity={0.7}
            >
              <Ionicons name={action.icon} size={isSmall ? 14 : 16} color="#4f46e5" />
              <Text style={[styles.quickBtnText, { fontSize: isSmall ? 12 : 13 }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.inputRow, { paddingHorizontal: hp }]}>
          <TextInput
            style={[styles.input, { fontSize: isSmall ? 14 : 15 }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about fitness..."
            placeholderTextColor="#6b7280"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn, 
              (!inputText.trim() || loading) && styles.sendBtnDisabled,
              isSmall && { width: 40, height: 40 }
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={isSmall ? 16 : 18} color="#fff" />
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
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  avatar: {
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  messageContent: {
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  userText: {
    color: '#fff',
    lineHeight: 22,
  },
  cursor: {
    color: '#4f46e5',
    fontSize: 14,
    marginTop: 2,
  },
  formattedContainer: {
    gap: 4,
  },
  heading: {
    color: '#a5b4fc',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    color: '#e5e7eb',
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginVertical: 2,
  },
  bullet: {
    color: '#4f46e5',
    marginRight: 8,
    fontWeight: '600',
  },
  bulletText: {
    color: '#e5e7eb',
    flex: 1,
    lineHeight: 22,
  },
  numberedRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginVertical: 4,
  },
  numberText: {
    color: '#4f46e5',
    fontWeight: '700',
    marginRight: 8,
    minWidth: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#fff',
  },
  spacer: {
    height: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingBottom: 16,
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
