import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { OfflineBanner } from './src/components/OfflineBanner';
import { COLORS } from './src/constants/theme';
import { ThemeProvider } from './src/context/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WorkerDashboardScreen from './src/screens/worker/WorkerDashboardScreen';
import WorkerJobsScreen from './src/screens/worker/WorkerJobsScreen';
import JobDetailScreen from './src/screens/worker/JobDetailScreen';
import ExpenseManagementScreen from './src/screens/worker/ExpenseManagementScreen';
import ManagerDashboardScreen from './src/screens/manager/ManagerDashboardScreen';
import TeamListScreen from './src/screens/manager/TeamListScreen';
import JobAssignmentScreen from './src/screens/manager/JobAssignmentScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import UserManagementScreen from './src/screens/admin/UserManagementScreen';
import CustomerManagementScreen from './src/screens/admin/CustomerManagementScreen';
import ApprovalsScreen from './src/screens/admin/ApprovalsScreen';
import CreateJobScreen from './src/screens/admin/CreateJobScreen';
import CalendarScreen from './src/screens/admin/CalendarScreen';
import CostManagementScreen from './src/screens/manager/CostManagementScreen';
import NotificationsScreen from './src/screens/worker/NotificationsScreen';
import notificationService from './src/services/notification.service';
import * as Notifications from 'expo-notifications';
import { SocketProvider } from './src/context/SocketContext';
import ToastNotification from './src/components/ToastNotification';
import { QueueService } from './src/services/QueueService';
import { SyncManager } from './src/services/SyncManager';

// Web specific styles injection
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    #root {
      display: flex;
      flex-direction: column;
    }
    #root > div {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    textarea, input {
      font-family: inherit;
    }
  `;
  document.head.appendChild(style);
}

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  // Determine initial route based on user role
  React.useEffect(() => {
    if (user?.id) {
      notificationService.registerForPushNotificationsAsync().then(token => {
        if (token) {
          notificationService.sendPushTokenToBackend(token, user.id);
        }
      });
    }
  }, [user]);

  // Handle incoming notifications
  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response received:", response);
      // Future: extract jobId and navigate
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  const getInitialRoute = () => {
    if (!user) return "Login";

    const role = user.role?.toUpperCase();

    switch (role) {
      case 'ADMIN':
        return 'AdminDashboard';
      case 'MANAGER':
        return 'ManagerDashboard';
      case 'WORKER':
      case 'TEAM_LEAD':
      default:
        return 'WorkerDashboard';
    }
  };

  return (
    <View style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          detachInactiveScreens={false}
          screenOptions={{
            animationEnabled: false,
            headerShown: true
          }}
        >
          {user ? (
            <>
              {/* Worker Screens */}
              <Stack.Screen
                name="WorkerDashboard"
                component={WorkerDashboardScreen}
                options={{ title: 'Dashboard' }}
              />
              <Stack.Screen
                name="Jobs"
                component={WorkerJobsScreen}
                options={{ title: 'İşlerim' }}
              />
              <Stack.Screen
                name="JobDetail"
                component={JobDetailScreen}
                options={{ title: 'İş Detayı' }}
              />
              <Stack.Screen
                name="ExpenseManagement"
                component={ExpenseManagementScreen}
                options={{ title: 'Masraf Yönetimi', headerShown: false }}
              />

              {/* Manager Screens */}
              <Stack.Screen
                name="ManagerDashboard"
                component={ManagerDashboardScreen}
                options={{ title: 'Manager Dashboard' }}
              />
              <Stack.Screen
                name="TeamList"
                component={TeamListScreen}
                options={{ title: 'Ekibim' }}
              />
              <Stack.Screen
                name="JobAssignment"
                component={JobAssignmentScreen}
                options={{ title: 'İş Atama' }}
              />
              <Stack.Screen
                name="CostManagement"
                component={CostManagementScreen}
                options={{ title: 'Masraf Yönetimi' }}
              />
              {/* Admin Screens */}
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ title: 'Admin Dashboard' }}
              />
              <Stack.Screen
                name="UserManagement"
                component={UserManagementScreen}
                options={{ title: 'Kullanıcı Yönetimi' }}
              />
              <Stack.Screen
                name="CustomerManagement"
                component={CustomerManagementScreen}
                options={{ title: 'Müşteri Yönetimi' }}
              />
              <Stack.Screen
                name="Approvals"
                component={ApprovalsScreen}
                options={{ title: 'Onaylar' }}
              />
              <Stack.Screen
                name="CreateJob"
                component={CreateJobScreen}
                options={{ title: 'Yeni İş Oluştur' }}
              />
              <Stack.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{ headerShown: false }}
              />
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
    </View>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.backgroundDark }}>
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>Bir hata oluştu</Text>
          <Text style={{ color: 'red', textAlign: 'center' }}>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  React.useEffect(() => {
    // Initialize Offline Queue
    QueueService.initialize();
    // Initialize Sync Manager
    SyncManager.init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <NetworkProvider>
            <ThemeProvider>
              <AuthProvider>
                <SocketProvider>
                  <OfflineBanner />
                  <AppNavigator />
                  <ToastNotification />
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </NetworkProvider>
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
