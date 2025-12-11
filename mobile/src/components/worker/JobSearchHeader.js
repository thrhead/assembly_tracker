import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const JobSearchHeader = ({ searchQuery, setSearchQuery, title = "Görevler" }) => {
    const [showSearch, setShowSearch] = useState(false);

    const toggleSearch = () => {
        const newState = !showSearch;
        setShowSearch(newState);
        if (!newState) {
            setSearchQuery('');
        }
    };

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <MaterialIcons name="assignment" size={30} color={COLORS.neonGreen} />
            </View>
            {showSearch ? (
                <TextInput
                    style={styles.searchInput}
                    placeholder="İş ara..."
                    placeholderTextColor={COLORS.textGray}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                />
            ) : (
                <Text style={styles.headerTitle}>{title}</Text>
            )}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={toggleSearch}
            >
                <MaterialIcons name={showSearch ? "close" : "search"} size={24} color={COLORS.neonGreen} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(0,0,0,0.8)', borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
    headerLeft: { width: 40, alignItems: 'flex-start' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textLight, flex: 1, textAlign: 'center' },
    searchInput: { flex: 1, color: COLORS.textLight, fontSize: 16, paddingHorizontal: 12, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginHorizontal: 12 },
    searchButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

export default JobSearchHeader;
