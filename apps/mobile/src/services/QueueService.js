import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const STORAGE_KEY = 'OFFLINE_QUEUE';
const MEDIA_DIR = `${FileSystem.documentDirectory}offline_media/`;

// Ensure media directory exists
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
  }
};

export const QueueService = {
  /**
   * Kuyruğa yeni bir işlem ekler
   */
  addItem: async (item) => {
    try {
      await ensureDirExists();
      const queue = await QueueService.getItems();

      let processedPayload = item.payload;
      let mediaPath = null;

      // Seviye 1: Büyük medya dosyalarını (fotoğraf) FileSystem'e taşı
      if (item.type === 'POST' && item.url.includes('/photos') && item.payload?.photo) {
        const fileName = `photo_${Date.now()}.txt`; // Base64 content
        mediaPath = `${MEDIA_DIR}${fileName}`;
        await FileSystem.writeAsStringAsync(mediaPath, item.payload.photo);

        // Payload'dan devasa base64'ü çıkar, sadece path bırak
        processedPayload = { ...item.payload, photo: null, _localUri: mediaPath };
      }

      const newItem = {
        ...item,
        payload: processedPayload,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        retryCount: 0,
        // Seviye 3 için istemci versiyonu ekle (varsa)
        clientVersion: item.clientVersion || null,
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
   * Kuyruğu başlatır ve bekleyen işlem sayısını döner
   */
  initialize: async () => {
    try {
      await ensureDirExists();
      const items = await QueueService.getItems();
      console.log(`[QueueService] Initialized with ${items.length} pending items.`);
      return items.length;
    } catch (error) {
      console.error('[QueueService] Initialization error:', error);
      return 0;
    }
  },

  /**
   * Kuyruktaki tüm işlemleri getirir
   */
  getItems: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error('[QueueService] JSON parse error, clearing corrupted queue:', parseError);
        await AsyncStorage.removeItem(STORAGE_KEY);
        return [];
      }
    } catch (error) {
      console.error('[QueueService] Error getting queue items:', error);
      return [];
    }
  },

  /**
   * Belirli bir işlemi kuyruktan siler ve dosyasını temizler
   */
  removeItem: async (id) => {
    try {
      const queue = await QueueService.getItems();
      const itemToRemove = queue.find(item => item.id === id);

      // Dosyayı temizle (Seviye 1)
      if (itemToRemove?.payload?._localUri) {
        try {
          await FileSystem.deleteAsync(itemToRemove.payload._localUri, { idempotent: true });
        } catch (e) {
          console.warn('[QueueService] Failed to delete local file:', e);
        }
      }

      const filteredQueue = queue.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Error removing item from queue:', error);
      throw error;
    }
  },

  /**
   * Kuyruktaki bir işlemi günceller
   */
  updateItem: async (updatedItem) => {
    try {
      const queue = await QueueService.getItems();
      const index = queue.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        queue[index] = updatedItem;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error updating queue item:', error);
      throw error;
    }
  },

  /**
   * Tüm kuyruğu temizler
   */
  clearQueue: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      // Tüm medya klasörünü temizle
      await FileSystem.deleteAsync(MEDIA_DIR, { idempotent: true });
      await ensureDirExists();
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  },
};
