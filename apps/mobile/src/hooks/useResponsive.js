import { useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from '../constants/theme';

export const useResponsive = () => {
    const { width } = useWindowDimensions();

    const isMobile = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    const isDesktop = width >= BREAKPOINTS.desktop && width < BREAKPOINTS.wide;
    const isWide = width >= BREAKPOINTS.wide;

    return {
        isMobile,
        isTablet,
        isDesktop,
        isWide,
        // Helper to check for "at least" a size
        isTabletOrUp: width >= BREAKPOINTS.tablet,
        isDesktopOrUp: width >= BREAKPOINTS.desktop,
        // Current raw width for custom logic
        width
    };
};
