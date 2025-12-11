import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const CategoryFilter = ({ selectedCategory, onSelect }) => {
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
                    style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                    onPress={() => onSelect(cat.id)}
                >
                    <MaterialIcons
                        name={cat.icon}
                        size={20}
                        color={selectedCategory === cat.id ? COLORS.primary : COLORS.slate400}
                    />
                    <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
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
        backgroundColor: COLORS.slate800,
        marginRight: 12,
    },
    categoryChipActive: {
        backgroundColor: 'rgba(206, 254, 4, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(206, 254, 4, 0.4)',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.slate400,
        marginLeft: 8,
    },
    categoryChipTextActive: {
        color: COLORS.primary,
    },
});

export default CategoryFilter;
