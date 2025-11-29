import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WorkerDashboardScreen from './src/screens/worker/WorkerDashboardScreen';
import WorkerJobsScreen from './src/screens/worker/WorkerJobsScreen';
import JobDetailScreen from './src/screens/worker/JobDetailScreen';
import ManagerDashboardScreen from './src/screens/manager/ManagerDashboardScreen';
import TeamListScreen from './src/screens/manager/TeamListScreen';
import JobAssignmentScreen from './src/screens/manager/JobAssignmentScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import UserManagementScreen from './src/screens/admin/UserManagementScreen';
import CustomerManagementScreen from './src/screens/admin/CustomerManagementScreen';
import CostManagementScreen from './src/screens/manager/CostManagementScreen';
import NotificationsScreen from './src/screens/worker/NotificationsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  console.log('AppNavigator - user:', user, 'loading:', loading);

  if (loading) {
    return null; // Veya bir loading screen
  }

  // Determine initial route based on user role
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
    <NavigationContainer key={user?.email || 'logged-out'}>
      <Stack.Navigator initialRouteName={getInitialRoute()}>
        {user ? (
          <>
            {/* Worker Screens */}
            <Stack.Screen
              name="WorkerDashboard"
              component={WorkerDashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
              name="WorkerJobs"
              component={WorkerJobsScreen}
              options={{ title: 'İşlerim' }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{ title: 'İş Detayı' }}
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

export default function App() {
  console.log('App component mounted. Wrapping with Providers...');
  return (
    <AuthProvider>
      <SocketProvider>
        <AppNavigator />
        <ToastNotification />
      </SocketProvider>
    </AuthProvider>
  );
}
