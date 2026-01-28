import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const JobFilterTabs = ({ selectedFilter, onSelectFilter }) => {
    const { theme, isDark } = useTheme();
    const filters = ['Tümü', 'Bekleyen', 'Devam Eden', 'Onay Bekleyen', 'Onaylanan', 'Tamamlanan'];

    return (
        <View style={styles.filterContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[
                    styles.filterWrapper,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        borderWidth: isDark ? 1 : 0
                    }
                ]}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterTab,
                                selectedFilter === filter && { backgroundColor: theme.colors.primary }
                            ]}
                            onPress={() => onSelectFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter
                                    ? { color: '#ffffff' }
                                    : { color: theme.colors.subText }
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: { paddingVertical: 12 },
    scrollContent: { paddingHorizontal: 16 },
    filterWrapper: { flexDirection: 'row', borderRadius: 12, padding: 4 }, // Modern smooth radius
    filterTab: { paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
    filterText: { fontSize: 13, fontWeight: '600' },
});

export default JobFilterTabs;
