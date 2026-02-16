import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../api';
import { QueueService } from '../QueueService';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../QueueService');

describe('API Interceptor (Offline Sync)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock adapter to prevent real network requests
    api.defaults.adapter = jest.fn().mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });
  });

  it('should send POST request normally when online', async () => {
    NetInfo.fetch.mockResolvedValue({ isConnected: true });
    
    try {
      await api.post('/test', { data: 'test' });
    } catch (e) {
      console.error(e);
    }

    expect(NetInfo.fetch).toHaveBeenCalled();
    expect(QueueService.addItem).not.toHaveBeenCalled();
  });

  it('should queue POST request when offline', async () => {
    NetInfo.fetch.mockResolvedValue({ isConnected: false });
    QueueService.addItem.mockResolvedValue({ id: 'mock-id' });

    const response = await api.post('/jobs/1/complete', { notes: 'done' });

    expect(NetInfo.fetch).toHaveBeenCalled();
    expect(QueueService.addItem).toHaveBeenCalledWith(expect.objectContaining({
      type: 'POST',
      url: '/jobs/1/complete',
      payload: { notes: 'done' },
      headers: expect.any(Object),
      clientVersion: null
    }));

    expect(response.status).toBe(202);
    expect(response.data.offline).toBe(true);
  });

  it('should queue PUT request when offline', async () => {
    NetInfo.fetch.mockResolvedValue({ isConnected: false });
    QueueService.addItem.mockResolvedValue({ id: 'mock-id' });

    const response = await api.put('/users/1', { name: 'New Name' });

    expect(QueueService.addItem).toHaveBeenCalledWith(expect.objectContaining({
      type: 'PUT',
      url: '/users/1'
    }));
    expect(response.status).toBe(202);
  });
});