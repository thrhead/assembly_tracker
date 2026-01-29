import { QueueService } from './QueueService';
import { LoggerService } from './LoggerService';
import api from './api';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { ToastService } from './ToastService';
import * as FileSystem from 'expo-file-system';

export const SyncManager = {
  isSyncing: false,
  unsubscribe: null,

  init: () => {
    if (SyncManager.unsubscribe) {
      SyncManager.unsubscribe();
    }

    // Network connection listener
    SyncManager.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('[SyncManager] Connection restored. Triggering sync...');
        SyncManager.sync();
      }
    });

    // App state listener (foreground/background)
    SyncManager.appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('[SyncManager] App returned to foreground. checking sync...');
        SyncManager.sync();
      }
    });
  },

  destroy: () => {
    if (SyncManager.unsubscribe) SyncManager.unsubscribe();
    if (SyncManager.appStateSubscription) SyncManager.appStateSubscription.remove();
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
        await LoggerService.sync(); // Also try syncing logs if queue is empty
        return true;
      }

      // Sync logs concurrently with queue sync
      LoggerService.sync().catch(console.error);
      // Sort by creation time (FIFO)
      const sortedQueue = queue.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      let successCount = 0;

      for (const item of sortedQueue) {
        if (item.retryCount >= 3) {
          console.warn(`[SyncManager] Item ${item.id} reached max retries. Skipping.`);
          continue;
        }

        try {
          console.log(`[SyncManager] Processing item: ${item.type} ${item.url}`);

          let response;
          let currentPayload = { ...item.payload };

          // Seviye 1: Eğer localUri varsa dosyayı tekrar oku (Fotoğraf verisi)
          if (currentPayload._localUri) {
            try {
              const fileContent = await FileSystem.readAsStringAsync(currentPayload._localUri);
              currentPayload.photo = fileContent;
              delete currentPayload._localUri;
            } catch (fileError) {
              console.error('[SyncManager] Local file not found, skipping item:', fileError);
              await QueueService.removeItem(item.id);
              continue;
            }
          }

          const config = {
            headers: {
              ...item.headers,
              // Seviye 3: Çatışma yönetimi için versiyon başlığı (veya payload parçası)
              'X-Client-Version': item.clientVersion || '0'
            }
          };

          switch (item.type) {
            case 'POST':
              response = await api.post(item.url, currentPayload, config);
              break;
            case 'PUT':
              response = await api.put(item.url, currentPayload, config);
              break;
            case 'PATCH':
              response = await api.patch(item.url, currentPayload, config);
              break;
            case 'DELETE':
              response = await api.delete(item.url, config);
              break;
          }

          if (response && (response.status >= 200 && response.status < 300)) {
            console.log(`[SyncManager] Item ${item.id} synced successfully.`);
            await QueueService.removeItem(item.id);
            successCount++;
          }
        } catch (error) {
          // Seviye 3: Çatışma (Conflict) durumunda özel işlem
          if (error.status === 409) {
            console.error(`[SyncManager] Conflict detected for item ${item.id}. Manual intervention required.`);
            ToastService.show('Veri Çakışması', 'Bu işlem sunucudaki güncel veriyle çakışıyor.', 'warning');
            // Çatışma durumunda öğeyi kuyruktan silip kullanıcıya bildirmek bir stratejidir.
            // Alternatif olarak 'conflicted' olarak işaretlenip listede gösterilebilir.
            await QueueService.removeItem(item.id);
            continue;
          }

          console.error(`[SyncManager] Failed to sync item ${item.id}:`, error.message);
          item.retryCount += 1;
          await QueueService.updateItem(item);

          if (item.retryCount >= 3) {
            ToastService.show('Senkronizasyon Hatası', 'Bazı veriler sunucuya gönderilemedi.', 'error');
          }
        }
      }

      if (successCount > 0) {
        ToastService.show('Senkronizasyon Tamamlandı', `${successCount} işlem sunucuya gönderildi.`, 'success');
      }

    } catch (error) {
      console.error('[SyncManager] Sync error:', error);
    } finally {
      SyncManager.isSyncing = false;
    }

    return true;
  }
};
