import { getInitialRouteName } from './src/utils/navigationHelper';
import { useNotificationListener } from './src/hooks/useNotificationListener';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/constants/theme';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/worker/NotificationsScreen';

import { WorkerStack } from './src/navigation/WorkerStack';
import { ManagerStack } from './src/navigation/ManagerStack';
import { AdminStack } from './src/navigation/AdminStack';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();


  // Use custom hook for notifications
  useNotificationListener(user);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer key={user?.email || 'logged-out'}>
      <Stack.Navigator initialRouteName={getInitialRouteName(user)}>
        {user ? (
          <>
            {/* Worker Screens */}
            <WorkerStack Stack={Stack} />

            {/* Manager Screens */}
            <ManagerStack Stack={Stack} />

            {/* Admin Screens */}
            <AdminStack Stack={Stack} />

            {/* Profile Screen */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profil ve Ayarlar' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ title: 'Bildirimler' }}
            />

            {/* Legacy Home Screen */}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Ana Sayfa' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { SocketProvider } from './src/context/SocketContext';
import ToastNotification from './src/components/ToastNotification';

import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <AuthProvider>
            <SocketProvider>
              <AppNavigator />
              <ToastNotification />
            </SocketProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
  },
});
