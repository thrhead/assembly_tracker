import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';

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

export const ProjectFilter = ({ projects, selectedProject, onSelect }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectFilterContainer}>
            {projects.map((project, index) => (
                <TouchableOpacity
                    key={project.id || index}
                    style={[
                        styles.projectChip,
                        selectedProject?.id === project.id ? styles.projectChipSelected : styles.projectChipUnselected
                    ]}
                    onPress={() => onSelect(project)}
                >
                    <Text style={[
                        styles.projectChipText,
                        selectedProject?.id === project.id ? styles.projectChipTextSelected : styles.projectChipTextUnselected
                    ]}>
                        {project.title}
                    </Text>
                    {selectedProject?.id === project.id && (
                        <MaterialIcons name="expand-more" size={20} color={COLORS.primary} />
                    )}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export const CategoryFilter = ({ selectedCategory, onSelect }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
            {CATEGORIES.map((cat) => (
                <TouchableOpacity
                    key={cat.id}
                    style={[
                        styles.categoryChip,
                        selectedCategory === cat.id ? styles.categoryChipSelected : styles.categoryChipUnselected
                    ]}
                    onPress={() => onSelect(cat.id)}
                >
                    <MaterialIcons
                        name={cat.icon}
                        size={20}
                        color={selectedCategory === cat.id ? COLORS.primary : COLORS.textGray}
                    />
                    <Text style={[
                        styles.categoryChipText,
                        selectedCategory === cat.id ? styles.categoryChipTextSelected : styles.categoryChipTextUnselected
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
    projectChipSelected: {
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        borderColor: 'rgba(204, 255, 4, 0.4)',
    },
    projectChipUnselected: {
        backgroundColor: COLORS.cardBorder,
        borderColor: COLORS.cardBorder,
    },
    projectChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    projectChipTextSelected: {
        color: COLORS.primary,
    },
    projectChipTextUnselected: {
        color: COLORS.textGray,
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
    categoryChipSelected: {
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(204, 255, 4, 0.4)',
    },
    categoryChipUnselected: {
        backgroundColor: COLORS.cardBorder,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    categoryChipTextSelected: {
        color: COLORS.primary,
    },
    categoryChipTextUnselected: {
        color: COLORS.textGray,
    },
});
