export const COLORS = {
    // Core Palette
    primary: "#CCFF04",
    backgroundLight: "#f8f8f5",
    backgroundDark: "#010100",
    cardDark: "#111827",
    cardBorder: "#1f2937",
    textLight: "#f8fafc",
    textGray: "#94a3b8",
    neonGreen: "#CCFF04",
    textDark: "#1e293b",

    // Slate
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",

    // Semantics
    white: "#ffffff",
    black: "#000000",
    amber500: "#f59e0b",
    red500: "#ef4444",
    red900: "#7f1d1d",
    green500: "#22c55e",
    blue500: "#3b82f6",
    purple500: "#a855f7",
    cyan500: "#06b6d4",
    pink500: "#ec4899",
    indigo500: "#6366f1",
    orange500: "#f97316",
    teal500: "#14b8a6",

    // New Modern Light Theme Colors (Requested)
    modernBg: "#F8F9FA",
    electricBlue: "#2D5BFF",
    emeraldStatus: "#10B981",
    amberStatus: "#F59E0B",
    glassCardLight: "rgba(255, 255, 255, 0.9)", // Increased opacity for better visibility
    glassBorderLight: "rgba(255, 255, 255, 0.4)",
    shadowLight: "rgba(31, 38, 135, 0.07)",
};

export const lightTheme = {
    id: 'light',
    colors: {
        background: COLORS.modernBg,
        text: COLORS.slate900,
        subText: COLORS.slate500,
        primary: COLORS.electricBlue,
        secondary: COLORS.emeraldStatus,
        tertiary: COLORS.amberStatus,
        card: COLORS.glassCardLight,
        cardBorder: COLORS.glassBorderLight, // Legacy key
        border: COLORS.glassBorderLight,     // New key used in refactor
        icon: COLORS.electricBlue,
        tab: COLORS.white,
        tabActive: COLORS.electricBlue,
        headerBg: "rgba(248, 249, 250, 0.9)",
        gradient: [COLORS.modernBg, COLORS.modernBg], // No gradient for light mode background in this design
        gradientStart: { x: 0, y: 0 },
        gradientEnd: { x: 0, y: 0 },
        textInverse: COLORS.white,
        error: COLORS.red500,
        surface: COLORS.white,

        // Status & Action Backgrounds (Opacity Tokens)
        primaryBg: "rgba(45, 91, 255, 0.1)", // Electric Blue 0.1
        warningBg: "rgba(245, 158, 11, 0.1)", // Amber 0.1
        cyanBg: "rgba(6, 182, 212, 0.1)",
        pinkBg: "rgba(236, 72, 153, 0.1)",
        tealBg: "rgba(20, 184, 166, 0.1)"
    }
};

export const darkTheme = {
    id: 'dark',
    colors: {
        background: COLORS.backgroundDark,
        text: COLORS.white,
        subText: COLORS.slate400,
        primary: COLORS.electricBlue, // Aligned with light theme for brand consistency
        secondary: COLORS.emeraldStatus,
        tertiary: COLORS.amber500,
        card: "rgba(255, 255, 255, 0.05)",
        cardBorder: "rgba(255, 255, 255, 0.1)", // Legacy key
        border: "rgba(255, 255, 255, 0.1)",      // New key used in refactor
        icon: COLORS.white,
        tab: "rgba(255,255,255,0.05)",
        tabActive: COLORS.primary,
        headerBg: "transparent",
        gradient: [COLORS.backgroundDark, '#1e1b4b'], // Deep Blue
        gradientStart: { x: 0.5, y: 0 },
        gradientEnd: { x: 0.5, y: 1 },
        textInverse: COLORS.black,
        error: COLORS.red500,
        surface: COLORS.slate900,

        // Status & Action Backgrounds (Opacity Tokens)
        primaryBg: "rgba(204, 255, 4, 0.1)", // Neon Green 0.1
        warningBg: "rgba(245, 158, 11, 0.1)", // Amber 0.1
        cyanBg: "rgba(6, 182, 212, 0.1)",
        pinkBg: "rgba(236, 72, 153, 0.1)",
        tealBg: "rgba(20, 184, 166, 0.1)"
    }
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.electricBlue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 32,
        elevation: 4,
    },
    dark: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
};

export const RADIUS = {
    s: 8,
    m: 12,
    l: 22, // Updated to match HTML rounded-[22px]
    xl: 32,
};

export const SPACING = {
    xs: 4,  // New: Extra Small for tight gaps
    s: 8,
    sm: 12, // New: Small-Medium for gaps/padding
    m: 16,
    ml: 20, // New: Medium-Large for card padding
    l: 24,
    xl: 32,
};

export const Z_INDEX = {
    base: 0,
    elevated: 10,
    dropdown: 50,
    sticky: 100,
    overlay: 200,
    modal: 300,
    toast: 1000,
};

export const BREAKPOINTS = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
};
