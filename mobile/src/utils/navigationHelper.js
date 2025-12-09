export const getInitialRouteName = (user) => {
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
