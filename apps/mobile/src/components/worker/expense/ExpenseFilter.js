import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { COLORS } from '../../../constants/theme'; // Removed legacy

export const CATEGORIES = [
    { id: 'Tümü', icon: 'tune', label: 'Tümü' },
    { id: 'Seyahat', icon: 'directions-car', label: 'Seyahat' },
    { id: 'Yol', icon: 'commute', label: 'Yol' },
    { id: 'Yemek', icon: 'restaurant', label: 'Yemek' },
    { id: 'Malzeme', icon: 'storefront', label: 'Malzeme' },
    { id: 'Konaklama', icon: 'hotel', label: 'Konaklama' },
    { id: 'Yakıt', icon: 'local-gas-station', label: 'Yakıt' },
    { id: 'Diğer', icon: 'more-horiz', label: 'Diğer' },
];

export const ProjectFilter = ({ projects, selectedProject, onSelect, theme }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectFilterContainer}>
            {projects.map((project, index) => (
                <TouchableOpacity
                    key={project.id || index}
                    style={[
                        styles.projectChip,
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                        selectedProject?.id === project.id ? { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary } : {}
                    ]}
                    onPress={() => onSelect(project)}
                >
                    <Text style={[
                        styles.projectChipText,
                        { color: theme.colors.subText },
                        selectedProject?.id === project.id ? { color: theme.colors.primary } : {}
                    ]}>
                        {project.title}
                    </Text>
                    {selectedProject?.id === project.id && (
                        <MaterialIcons name="expand-more" size={20} color={theme.colors.primary} />
                    )}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export const CategoryFilter = ({ selectedCategory, onSelect, theme }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
            {CATEGORIES.map((cat) => (
                <TouchableOpacity
                    key={cat.id}
                    style={[
                        styles.categoryChip,
                        { backgroundColor: theme.colors.surface },
                        selectedCategory === cat.id ? { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary, borderWidth: 1 } : {}
                    ]}
                    onPress={() => onSelect(cat.id)}
                >
                    <MaterialIcons
                        name={cat.icon}
                        size={20}
                        color={selectedCategory === cat.id ? theme.colors.primary : theme.colors.subText}
                    />
                    <Text style={[
                        styles.categoryChipText,
                        { color: theme.colors.subText },
                        selectedCategory === cat.id ? { color: theme.colors.primary } : {}
                    ]}>
                        {cat.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    projectFilterContainer: {
        padding: 16,
        flexDirection: 'row',
    },
    projectChip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
    },
    projectChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    categoryFilterContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
        flexDirection: 'row',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        marginRight: 12,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
});
