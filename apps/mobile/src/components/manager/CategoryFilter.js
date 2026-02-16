import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const CategoryFilter = ({ selectedCategory, onSelect, theme }) => {
    const colors = theme ? theme.colors : COLORS;
    const categories = [
        { id: 'ALL', label: 'Tümü', icon: 'tune' },
        { id: 'TRAVEL', label: 'Ulaşım', icon: 'directions-car' },
        { id: 'FOOD', label: 'Yemek', icon: 'restaurant' },
        { id: 'SUPPLIES', label: 'Malzeme', icon: 'store' },
        { id: 'TOOLS', label: 'Araçlar', icon: 'construction' },
    ];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {categories.map(cat => (
                <TouchableOpacity
                    key={cat.id}
                    style={[
                        styles.categoryChip,
                        { backgroundColor: colors.surface },
                        selectedCategory === cat.id && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: `${colors.primary}60` }
                    ]}
                    onPress={() => onSelect(cat.id)}
                >
                    <MaterialIcons
                        name={cat.icon}
                        size={20}
                        color={selectedCategory === cat.id ? colors.primary : (colors.subText || COLORS.slate400)}
                    />
                    <Text style={[
                        styles.categoryChipText,
                        { color: colors.subText },
                        selectedCategory === cat.id && { color: colors.primary }
                    ]}>
                        {cat.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    categoryFilter: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default CategoryFilter;
