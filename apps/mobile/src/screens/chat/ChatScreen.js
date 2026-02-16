import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Send, Lock, WifiOff, ChevronLeft } from 'lucide-react-native';
import { MessageService } from '../../services/message.service';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSocketServer } from '../../services/api'; // Assuming socket logic is accessible or use a hook
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API_BASE_URL } from '../../services/api';

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId, jobTitle } = route.params || {};
    
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    
    const socketRef = useRef(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        loadInitialData();
        setupSocket();
        
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const loadInitialData = async () => {
        try {
            // Load current user
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) setCurrentUser(JSON.parse(userStr));

            // Load messages
            const data = await MessageService.getMessages({ jobId });
            setMessages(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load chat data:', error);
            setLoading(false);
        }
    };

    const setupSocket = async () => {
        const token = await AsyncStorage.getItem('authToken');
        
        socketRef.current = io(API_BASE_URL, {
            path: '/api/socket',
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
            socketRef.current.emit('join:job', jobId);
        });

        socketRef.current.on('receive:message', (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
            // Optional: Decrypt if needed, but service handles it usually
        });

        socketRef.current.on('typing:start', (data) => {
            if (data.userId !== currentUser?.id) setIsTyping(true);
        });

        socketRef.current.on('typing:stop', () => {
            setIsTyping(false);
        });
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const messageContent = inputText.trim();
        setInputText('');

        try {
            const newMessage = await MessageService.sendMessage({
                content: messageContent,
                jobId: jobId,
                isEncrypted: true // Always encrypt by default for security
            });

            setMessages(prev => [...prev, {
                ...newMessage,
                sender: currentUser // Local display optimization
            }]);
            
            // Scroll to bottom
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const renderMessage = ({ item }) => {
        const isMine = item.senderId === currentUser?.id || item.sender?.id === currentUser?.id;
        
        return (
            <View style={[
                styles.messageContainer,
                isMine ? styles.myMessage : styles.theirMessage
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMine ? styles.myBubble : styles.theirBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMine ? styles.myMessageText : styles.theirMessageText
                    ]}>
                        {item.content}
                    </Text>
                    <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>
                            {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {item.isEncrypted && (
                            <Lock size={10} color={isMine ? '#E0E0E0' : '#9E9E9E'} style={{ marginLeft: 4 }} />
                        )}
                        {item.status === 'queued' && (
                            <WifiOff size={10} color="#FF9800" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Fallback for PWA refresh
            navigation.navigate('WorkerDashboard');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft color="#333" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{jobTitle || 'İş Sohbeti'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {isTyping ? 'Yazıyor...' : 'Çevrimiçi'}
                    </Text>
                </View>
            </View>

            {loading && messages.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <>
                    {/* Messages List */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id || item.tempId}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    />

                    {/* Input Area */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    >
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Mesaj yazın..."
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                                onPress={handleSendMessage}
                                disabled={!inputText.trim()}
                            >
                                <Send size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#4CAF50',
    },
    listContent: {
        padding: 15,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 10,
        width: '100%',
        flexDirection: 'row',
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    theirMessage: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
    },
    myBubble: {
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#333',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.4)',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 15,
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
});

export default ChatScreen;
