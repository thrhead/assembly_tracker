import { QueueService } from './QueueService';
import api from './api';
import NetInfo from '@react-native-community/netinfo';

export const SyncManager = {
  isSyncing: false,
  unsubscribe: null,

  init: () => {
    if (SyncManager.unsubscribe) {
      SyncManager.unsubscribe();
    }

    SyncManager.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('[SyncManager] Connection restored. Triggering sync...');
        SyncManager.sync();
      }
    });
  },

  sync: async () => {
    if (SyncManager.isSyncing) return false;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return false;

    SyncManager.isSyncing = true;
    console.log('[SyncManager] Starting sync process...');

    try {
      const queue = await QueueService.getItems();
      if (queue.length === 0) {
        console.log('[SyncManager] Queue is empty.');
        SyncManager.isSyncing = false;
        return true;
      }

      // Sort by creation time (FIFO)
      const sortedQueue = queue.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      for (const item of sortedQueue) {
        if (item.retryCount >= 3) {
          console.warn(`[SyncManager] Item ${item.id} reached max retries. Skipping.`);
          continue;
        }

        try {
          console.log(`[SyncManager] Processing item: ${item.type} ${item.url}`);
          
          let response;
          const config = { headers: item.headers };

          switch (item.type) {
            case 'POST':
              response = await api.post(item.url, item.payload, config);
              break;
            case 'PUT':
              response = await api.put(item.url, item.payload, config);
              break;
            case 'PATCH':
              response = await api.patch(item.url, item.payload, config);
              break;
            case 'DELETE':
              response = await api.delete(item.url, config);
              break;
          }

          if (response && (response.status >= 200 && response.status < 300)) {
             console.log(`[SyncManager] Item ${item.id} synced successfully.`);
             await QueueService.removeItem(item.id);
          }
        } catch (error) {
          console.error(`[SyncManager] Failed to sync item ${item.id}:`, error.message);
          item.retryCount += 1;
          await QueueService.updateItem(item);
        }
      }
    } catch (error) {
      console.error('[SyncManager] Sync error:', error);
    } finally {
      SyncManager.isSyncing = false;
    }
    
    return true;
  }
};
