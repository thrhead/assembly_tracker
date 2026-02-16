import { renderHook } from '@testing-library/react-native';
import { useResponsive } from '../useResponsive';
import { useWindowDimensions } from 'react-native';

// Mock react-native
jest.mock('react-native', () => {
    return {
        useWindowDimensions: jest.fn(),
    };
});

describe('useResponsive Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('detects mobile devices', () => {
        useWindowDimensions.mockReturnValue({ width: 375, height: 812 });
        const { result } = renderHook(() => useResponsive());
        
        expect(result.current.isMobile).toBe(true);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.isTabletOrUp).toBe(false);
    });

    it('detects tablet devices', () => {
        useWindowDimensions.mockReturnValue({ width: 800, height: 1024 });
        const { result } = renderHook(() => useResponsive());
        
        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(true);
        expect(result.current.isTabletOrUp).toBe(true);
        expect(result.current.isDesktop).toBe(false);
    });

    it('detects desktop devices', () => {
        useWindowDimensions.mockReturnValue({ width: 1440, height: 900 });
        const { result } = renderHook(() => useResponsive());
        
        expect(result.current.isDesktop).toBe(false); // 1440 is wide (>= 1280)
        expect(result.current.isWide).toBe(true);
        expect(result.current.isDesktopOrUp).toBe(true);
    });
});
