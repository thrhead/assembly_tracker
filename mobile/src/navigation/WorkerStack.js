import React from 'react';
import WorkerDashboardScreen from '../screens/worker/WorkerDashboardScreen';
import WorkerJobsScreen from '../screens/worker/WorkerJobsScreen';
import JobDetailScreen from '../screens/worker/JobDetailScreen';
import ExpenseManagementScreen from '../screens/worker/ExpenseManagementScreen';

export const WorkerStack = ({ Stack }) => {
    return (
        <>
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
        </>
    );
};
