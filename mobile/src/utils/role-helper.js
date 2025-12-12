export const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin': return '#EF4444';
        case 'manager': return '#F59E0B';
        case 'worker': return '#3B82F6';
        default: return '#6B7280';
    }
};

export const getRoleText = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin': return 'Admin';
        case 'manager': return 'Yönetici';
        case 'worker': return 'Çalışan';
        default: return 'Kullanıcı';
    }
};
