import 'react-native-gesture-handler';
import './src/i18n/config';
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
import AdvancedPlanningScreen from './src/screens/admin/AdvancedPlanningScreen';
import ReportsScreen from './src/screens/admin/ReportsScreen';
import TeamManagementScreen from './src/screens/admin/TeamManagementScreen';
import TeamDetailScreen from './src/screens/admin/TeamDetailScreen';
import CostManagementScreen from './src/screens/manager/CostManagementScreen';
import NotificationsScreen from './src/screens/worker/NotificationsScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import notificationService from './src/services/notification.service';
import * as Notifications from 'expo-notifications';
import { SocketProvider } from './src/context/SocketContext';
import ToastNotification from './src/components/ToastNotification';
import { QueueService } from './src/services/QueueService';
import { SyncManager } from './src/services/SyncManager';
import { linking } from './src/utils/linking';
import { useTranslation } from 'react-i18next';

// Web specific styles injection
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      width: 100%;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    #root > div {
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  `;
  document.head.append(style);
}

const Stack = createStackNavigator();

function getInitialRoute(user) {
  if (!user) return 'Login';
  switch (user.role?.toUpperCase()) {
    case 'ADMIN': return 'AdminDashboard';
    case 'MANAGER': return 'ManagerDashboard';
    case 'WORKER':
    case 'TEAM_LEAD':
      return 'WorkerDashboard';
    default: return 'Login';
  }
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, height: '100%' }}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          initialRouteName={getInitialRoute(user)}
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
                options={{ title: t('navigation.home') }}
              />
              <Stack.Screen
                name="Jobs"
                component={WorkerJobsScreen}
                options={{ title: t('navigation.jobs') }}
              />
              <Stack.Screen
                name="JobDetail"
                component={JobDetailScreen}
                options={{ title: t('worker.jobDetails') }}
              />
              <Stack.Screen
                name="ExpenseManagement"
                component={ExpenseManagementScreen}
                options={{ title: t('worker.expenses'), headerShown: false }}
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
                options={{ title: t('navigation.teams') }}
              />
              <Stack.Screen
                name="JobAssignment"
                component={JobAssignmentScreen}
                options={{ title: t('navigation.jobAssignment') || 'Job Assignment' }}
              />
              <Stack.Screen
                name="CostManagement"
                component={CostManagementScreen}
                options={{ title: t('worker.expenses') }}
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
                options={{ title: t('navigation.userManagement') || 'User Management' }}
              />
              <Stack.Screen
                name="CustomerManagement"
                component={CustomerManagementScreen}
                options={{ title: t('navigation.customers') || 'Customer Management' }}
              />
              <Stack.Screen
                name="Approvals"
                component={ApprovalsScreen}
                options={{ title: t('navigation.approvals') || 'Approvals' }}
              />
              <Stack.Screen
                name="CreateJob"
                component={CreateJobScreen}
                options={{ title: t('navigation.createJob') || 'Create Job' }}
              />
              <Stack.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AdvancedPlanning"
                component={AdvancedPlanningScreen}
                options={{ title: 'Gelişmiş Planlama' }}
              />
              <Stack.Screen
                name="Reports"
                component={ReportsScreen}
                options={{ title: 'Analiz & Raporlar' }}
              />
              <Stack.Screen
                name="TeamManagement"
                component={TeamManagementScreen}
                options={{ title: t('navigation.teams') }}
              />
              <Stack.Screen
                name="TeamDetail"
                component={TeamDetailScreen}
                options={{ title: t('navigation.teamDetails') || 'Team Details' }}
              />
              {/* Profile Screen */}
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: t('navigation.profile') }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: t('navigation.notifications') || 'Notifications' }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
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
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>Bir hata oluştu / An error occurred</Text>
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
    <GestureHandlerRootView style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%', // Ensure it takes full height on web
      // CRITICAL: Ensure touch-action is permitted for native scrolling on web
      ...(Platform.OS === 'web' && { touchAction: 'auto', overflow: 'auto' })
    }}>
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
// Trigger 2
