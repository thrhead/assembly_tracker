import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const JobFilterTabs = ({ selectedFilter, onSelectFilter }) => {
    const filters = ['Tümü', 'Devam Eden', 'Bekleyen', 'Tamamlanan'];

    return (
        <View style={styles.filterContainer}>
            <View style={styles.filterWrapper}>
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
                        onPress={() => onSelectFilter(filter)}
                    >
                        <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: { padding: 16, paddingBottom: 12 },
    filterWrapper: { flexDirection: 'row', backgroundColor: COLORS.cardDark, borderRadius: 8, padding: 4 },
    filterTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6 },
    filterTabActive: { backgroundColor: COLORS.neonGreen },
    filterText: { fontSize: 13, fontWeight: '500', color: COLORS.textGray },
    filterTextActive: { color: COLORS.black },
});

export default JobFilterTabs;
