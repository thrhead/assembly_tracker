import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import NetInfo from '@react-native-community/netinfo';

const STORAGE_KEY = 'SYSTEM_LOGS';
const BATCH_SIZE = 5; // Reduced from 20 for faster testing

export const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    AUDIT: 'AUDIT',
};

export const LoggerService = {
    _interval: null,

    /**
     * Initialize the Logger Service (starts background sync and sets up global error handlers)
     */
    init: () => {
        if (LoggerService._interval) return;

        // Sync every 60 seconds to ensure logs are not stuck
        LoggerService._interval = setInterval(() => {
            LoggerService.sync();
        }, 60000);

        // Set up global error handlers
        if (typeof global !== 'undefined') {
            // Unhandled JS Errors
            const originalHandler = ErrorUtils.getGlobalHandler();
            ErrorUtils.setGlobalHandler((error, isFatal) => {
                LoggerService.error(`Unhandled Error (${isFatal ? 'Fatal' : 'Non-fatal'}): ${error.message}`, null, error.stack);
                if (originalHandler) {
                    originalHandler(error, isFatal);
                }
            });

            // Unhandled Promise Rejections
            // Note: This is a bit more complex in RN depending on the version, 
            // but we'll try to hook into it if possible.
        }
    },

    /**
     * Adds a new log to the queue
     */
    log: async (level, message, context = null, stack = null) => {
        try {
            const logs = await LoggerService.getLogs();
            const newLog = {
                level,
                message,
                context,
                stack,
                platform: 'mobile',
                createdAt: new Date().toISOString(),
            };

            logs.push(newLog);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

            // Also log to console in development
            if (__DEV__) {
                console.log(`[LoggerService] [${level}] ${message}`, context || '');
            }

            // Trigger sync if batch size reached
            if (logs.length >= BATCH_SIZE) {
                LoggerService.sync();
            }
        } catch (error) {
            console.error('Error adding log:', error);
        }
    },

    debug: (msg, ctx) => LoggerService.log(LogLevel.DEBUG, msg, ctx),
    info: (msg, ctx) => LoggerService.log(LogLevel.INFO, msg, ctx),
    warn: (msg, ctx) => LoggerService.log(LogLevel.WARN, msg, ctx),
    error: (msg, ctx, stack) => LoggerService.log(LogLevel.ERROR, msg, ctx, stack),
    audit: (msg, ctx) => LoggerService.log(LogLevel.AUDIT, msg, ctx),

    getLogs: async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Synchronizes logs with the server
     */
    sync: async () => {
        let logs = [];
        try {
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) return;

            logs = await LoggerService.getLogs();
            if (logs.length === 0) return;

            // Use the batch endpoint
            const response = await api.post('/api/logs/batch', logs);

            if (response.status === 201) {
                // Clear synced logs
                await AsyncStorage.removeItem(STORAGE_KEY);
                if (__DEV__) {
                    console.log(`[LoggerService] Synced ${logs.length} logs.`);
                }
            } else {
                 console.warn(`[LoggerService] Server responded with status ${response.status}. Keeping logs.`);
            }
        } catch (error) {
            // Silently fail to avoid infinite loops if API itself logs errors
            // IMPORTANT: We do NOT remove logs from storage here, they will retry next time.
            if (__DEV__) {
                console.warn('[LoggerService] Sync failed:', error.message);
            }
        }
    }
};
