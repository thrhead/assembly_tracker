import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'OFFLINE_QUEUE';

export const QueueService = {
  /**
   * Kuyruğa yeni bir işlem ekler
   */
  addItem: async (item) => {
    try {
      const queue = await QueueService.getItems();
      const newItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        retryCount: 0,
      };
      
      queue.push(newItem);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      return newItem;
    } catch (error) {
      console.error('Error adding item to queue:', error);
      throw error;
    }
  },

  /**
   * Kuyruktaki tüm işlemleri getirir
   */
  getItems: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting queue items:', error);
      return [];
    }
  },

  /**
   * Belirli bir işlemi kuyruktan siler
   */
  removeItem: async (id) => {
    try {
      const queue = await QueueService.getItems();
      const filteredQueue = queue.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Error removing item from queue:', error);
      throw error;
    }
  },

  /**
   * Tüm kuyruğu temizler
   */
  clearQueue: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  },
};
