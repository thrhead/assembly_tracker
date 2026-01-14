import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueService } from '../QueueService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('QueueService', () => {
  const STORAGE_KEY = 'OFFLINE_QUEUE';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add an item to the queue', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
    
    const item = { type: 'TEST_ACTION', payload: { data: 'test' } };
    await QueueService.addItem(item);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('TEST_ACTION')
    );
    
    const savedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
    expect(savedData[0]).toMatchObject(item);
    expect(savedData[0].id).toBeDefined();
    expect(savedData[0].createdAt).toBeDefined();
    expect(savedData[0].retryCount).toBe(0);
  });

  it('should get all items from the queue', async () => {
    const mockQueue = [{ id: '1', type: 'ACTION' }];
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockQueue));

    const items = await QueueService.getItems();
    expect(items).toEqual(mockQueue);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('should return empty array if queue is empty', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const items = await QueueService.getItems();
    expect(items).toEqual([]);
  });

  it('should remove an item by id', async () => {
    const mockQueue = [
      { id: '1', type: 'ACTION1' },
      { id: '2', type: 'ACTION2' }
    ];
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockQueue));

    await QueueService.removeItem('1');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify([{ id: '2', type: 'ACTION2' }])
    );
  });

  it('should clear the entire queue', async () => {
    await QueueService.clearQueue();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  describe('initialize', () => {
    it('should return the count of items in queue', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: '1' }, { id: '2' }]));
      const count = await QueueService.initialize();
      expect(count).toBe(2);
    });

    it('should return 0 and log error if data is corrupted', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const count = await QueueService.initialize();
      
      expect(count).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
