import React from 'react';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import TeamListScreen from '../screens/manager/TeamListScreen';
import JobAssignmentScreen from '../screens/manager/JobAssignmentScreen';
import CostManagementScreen from '../screens/manager/CostManagementScreen';

export const ManagerStack = ({ Stack }) => {
    return (
        <>
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
        </>
    );
};
