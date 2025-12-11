import { COLORS } from '../constants/theme';

export const getCategoryIcon = (category) => {
    const map = {
        'TRAVEL': 'directions-car',
        'FOOD': 'restaurant',
        'SUPPLIES': 'store',
        'TOOLS': 'construction',
        'OTHER': 'category'
    };
    return map[category] || 'receipt';
};

export const getCategoryColor = (category) => {
    const map = {
        'TRAVEL': COLORS.blue500,
        'FOOD': COLORS.red500,
        'SUPPLIES': '#8B5CF6',
        'TOOLS': COLORS.amber500,
        'OTHER': COLORS.slate600
    };
    return map[category] || COLORS.slate600;
};
