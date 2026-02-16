import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    USER: '@assembly_tracker:user',
    TOKEN: '@assembly_tracker:token',
};

export const storage = {
    // Kullanıcı bilgilerini kaydet
    saveUser: async (user) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user:', error);
        }
    },

    // Kullanıcı bilgilerini al
    getUser: async () => {
        try {
            const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    // Token kaydet
    saveToken: async (token) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        } catch (error) {
            console.error('Error saving token:', error);
        }
    },

    // Token al
    getToken: async () => {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    // Tüm verileri temizle (logout)
    clearAll: async () => {
        try {
            await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    },
};
