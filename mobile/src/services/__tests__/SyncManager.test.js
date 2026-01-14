import { SyncManager } from '../SyncManager';
import { QueueService } from '../QueueService';
import api from '../api';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../QueueService');
jest.mock('../api');
jest.mock('@react-native-community/netinfo');

describe('SyncManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    NetInfo.fetch.mockResolvedValue({ isConnected: true });
  });

  it('should process queue when connection is restored', async () => {
    const mockQueue = [
      { id: '1', type: 'POST', url: '/jobs/1/complete', payload: {}, retryCount: 0 },
      { id: '2', type: 'PUT', url: '/users/1', payload: {}, retryCount: 0 }
    ];
    QueueService.getItems.mockResolvedValue(mockQueue);
    api.post.mockResolvedValue({ status: 200 });
    api.put.mockResolvedValue({ status: 200 });

    await SyncManager.sync();

    expect(api.post).toHaveBeenCalledWith('/jobs/1/complete', {}, expect.any(Object));
    expect(api.put).toHaveBeenCalledWith('/users/1', {}, expect.any(Object));
    expect(QueueService.removeItem).toHaveBeenCalledTimes(2);
  });

  it('should not process queue if offline', async () => {
    NetInfo.fetch.mockResolvedValue({ isConnected: false });
    const result = await SyncManager.sync();
    expect(result).toBe(false);
    expect(QueueService.getItems).not.toHaveBeenCalled();
  });

  it('should handle failed requests by increasing retry count', async () => {
    const mockItem = { id: '1', type: 'POST', url: '/test', payload: {}, retryCount: 0 };
    QueueService.getItems.mockResolvedValue([mockItem]);
    api.post.mockRejectedValue(new Error('Network Error'));

    await SyncManager.sync();

    expect(QueueService.removeItem).not.toHaveBeenCalled();
    expect(QueueService.updateItem).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        retryCount: 1
    }));
  });

  it('should stop processing if retry limit reached', async () => {
    const mockItem = { id: '1', type: 'POST', url: '/test', payload: {}, retryCount: 3 };
    QueueService.getItems.mockResolvedValue([mockItem]);

    await SyncManager.sync();

    expect(api.post).not.toHaveBeenCalled();
    // In a real app, we might move this to a 'failed' queue or notify user
    // For now, we just skip it in the sync loop
  });
});
