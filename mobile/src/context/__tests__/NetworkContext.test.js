import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { NetworkProvider, useNetwork } from '../NetworkContext';
import NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

describe('NetworkContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock return for addEventListener
    NetInfo.addEventListener.mockReturnValue(() => {});
  });

  it('should provide isConnected status', async () => {
    NetInfo.fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    
    const wrapper = ({ children }) => <NetworkProvider>{children}</NetworkProvider>;
    const { result } = renderHook(() => useNetwork(), { wrapper });

    // Wait for the useEffect to complete the fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    }); 

    expect(result.current.isConnected).toBe(true);
  });

  it('should update isConnected status when NetInfo emits changes', async () => {
    let callback;
    NetInfo.addEventListener.mockImplementation((cb) => {
      callback = cb;
      return () => {};
    });
    NetInfo.fetch.mockResolvedValue({ isConnected: true });

    const wrapper = ({ children }) => <NetworkProvider>{children}</NetworkProvider>;
    const { result } = renderHook(() => useNetwork(), { wrapper });

    // Wait for initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate network change
    await act(async () => {
      if (callback) {
        callback({ isConnected: false, isInternetReachable: false });
      }
    });

    expect(result.current.isConnected).toBe(false);
  });
});
