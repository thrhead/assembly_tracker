import React from 'react';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import CustomerManagementScreen from '../screens/admin/CustomerManagementScreen';
import ApprovalsScreen from '../screens/admin/ApprovalsScreen';
import CreateJobScreen from '../screens/admin/CreateJobScreen';
import CalendarScreen from '../screens/admin/CalendarScreen';

export const AdminStack = ({ Stack }) => {
    return (
        <>
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
        </>
    );
};
