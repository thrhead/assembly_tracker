import { COLORS } from '../constants/theme';

export const getStatusColor = (status) => {
    const colors = {
        'PENDING': COLORS.amber500,
        'IN_PROGRESS': COLORS.blue500,
        'COMPLETED': COLORS.green500,
        'ON_HOLD': COLORS.slate600,
        'CANCELLED': COLORS.red500
    };
    return colors[status] || COLORS.slate600;
};

export const getStatusLabel = (status) => {
    const labels = {
        'PENDING': 'Beklemede',
        'IN_PROGRESS': 'Devam Ediyor',
        'COMPLETED': 'Tamamlandı',
        'ON_HOLD': 'Askıda',
        'CANCELLED': 'İptal'
    };
    return labels[status] || status;
};

export const getPriorityColor = (priority) => {
    const colors = {
        'URGENT': COLORS.red500,
        'HIGH': COLORS.amber500,
        'MEDIUM': COLORS.blue500,
        'LOW': COLORS.slate600
    };
    return colors[priority] || COLORS.slate600;
};
