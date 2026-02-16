import React from 'react';
import { render } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';
import { useNetwork } from '../../context/NetworkContext';

// Mock useNetwork
jest.mock('../../context/NetworkContext', () => ({
  useNetwork: jest.fn(),
}));

describe('OfflineBanner', () => {
  it('should not render when connected', () => {
    useNetwork.mockReturnValue({ isConnected: true });
    const { queryByText } = render(<OfflineBanner />);
    expect(queryByText(/Bağlantı Yok/i)).toBeNull();
  });

  it('should render warning when disconnected', () => {
    useNetwork.mockReturnValue({ isConnected: false });
    const { getByText } = render(<OfflineBanner />);
    expect(getByText(/Bağlantı Yok/i)).toBeTruthy();
  });
});
