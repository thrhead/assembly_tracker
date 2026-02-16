import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
  useNetInfo: jest.fn(() => ({ type: 'wifi', isConnected: true })),
}));

// Mock Expo File System
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test-directory/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: true })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock Expo Constants (common dependency)
jest.mock('expo-constants', () => ({
  manifest: { extra: {} },
}));

// Mock Icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
}));

jest.mock('lucide-react-native', () => ({
  Mic: 'Mic',
  Square: 'Square',
  Play: 'Play',
  Trash2: 'Trash2',
  Loader2: 'Loader2',
  ClipboardCheck: 'ClipboardCheck',
}));

// Mock AlertContext
jest.mock('./src/context/AlertContext', () => ({
  useAlert: () => ({
    showAlert: jest.fn(),
  }),
  AlertProvider: ({ children }) => children,
}));

// Mock ThemeContext
jest.mock('./src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#fff',
        card: '#fff',
        text: '#000',
        primary: '#000',
        border: '#ccc',
        error: 'red',
        subText: '#666'
      }
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'tr',
    },
  }),
  Trans: ({ children }) => children,
}));

// Suppress megaphone errors
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));
