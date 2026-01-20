import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const JobSearchHeader = ({ searchQuery, setSearchQuery, title = "Görevler" }) => {
    const { theme, isDark } = useTheme();
    const [showSearch, setShowSearch] = useState(false);

    const toggleSearch = () => {
        const newState = !showSearch;
        setShowSearch(newState);
        if (!newState) {
            setSearchQuery('');
        }
    };

    return (
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.headerLeft}>
                <MaterialIcons name="assignment" size={30} color={theme.colors.primary} />
            </View>
            {showSearch ? (
                <TextInput
                    style={[styles.searchInput, {
                        color: theme.colors.text,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }]}
                    placeholder="İş ara..."
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                />
            ) : (
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
            )}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={toggleSearch}
            >
                <MaterialIcons name={showSearch ? "close" : "search"} size={24} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8, borderBottomWidth: 1 }, // Removed bg color
    headerLeft: { width: 40, alignItems: 'flex-start' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    searchInput: { flex: 1, fontSize: 16, paddingHorizontal: 12, height: 40, borderRadius: 8, marginHorizontal: 12 },
    searchButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

export default JobSearchHeader;
