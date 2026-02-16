import api from './api';
import { CryptoService } from './crypto-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MessageService = {
    /**
     * Fetch messages for a specific job or conversation
     * @param {Object} params { jobId, conversationId }
     */
    getMessages: async (params) => {
        try {
            const response = await api.get('/api/messages', { params });
            const messages = response.data;

            // Decrypt messages if they are encrypted
            const decryptedMessages = await Promise.all(
                messages.map(async (msg) => {
                    if (msg.isEncrypted) {
                        const decryptedContent = await CryptoService.decrypt(msg.content);
                        return { ...msg, content: decryptedContent };
                    }
                    return msg;
                })
            );

            return decryptedMessages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    /**
     * Send a new message
     * @param {Object} messageData { content, jobId, receiverId, isEncrypted }
     */
    sendMessage: async (messageData) => {
        try {
            let contentToSend = messageData.content;
            let isEncrypted = messageData.isEncrypted || false;

            // Encrypt if requested
            if (isEncrypted) {
                contentToSend = await CryptoService.encrypt(messageData.content);
            }

            const response = await api.post('/api/messages', {
                ...messageData,
                content: contentToSend,
                isEncrypted
            });

            // If the message was sent successfully (not just queued), decrypt the response content for UI
            if (response.data && isEncrypted && !response.data.offline) {
                const decryptedContent = await CryptoService.decrypt(response.data.content);
                return { ...response.data, content: decryptedContent };
            }

            // If queued (offline), return the original content so UI can show it immediately
            if (response.data && response.data.offline) {
                const offlineMsg = {
                    ...response.data,
                    content: messageData.content,
                    id: `temp_${Date.now()}`, // Temporary ID for UI
                    sentAt: new Date().toISOString(),
                    status: 'queued'
                };

                // Optimistically update cache
                const cacheKey = `messages_${messageData.jobId}`;
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const current = JSON.parse(cached);
                    await AsyncStorage.setItem(cacheKey, JSON.stringify([...current, offlineMsg]));
                }

                return offlineMsg;
            }

            // Update cache for online success too
            const sentMsg = { ...response.data, content: messageData.content }; // already decrypted content in scope
            const cacheKey = `messages_${messageData.jobId}`;
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
                const current = JSON.parse(cached);
                await AsyncStorage.setItem(cacheKey, JSON.stringify([...current, sentMsg]));
            }

            return sentMsg;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
};
