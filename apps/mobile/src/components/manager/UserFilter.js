import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const UserFilter = ({ users, selectedUserId, onSelect, theme }) => {
    const colors = theme ? theme.colors : COLORS;

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.subText }]}>Personel</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={[
                        styles.chip,
                        {
                            backgroundColor: !selectedUserId ? colors.primary : colors.surface,
                            borderColor: !selectedUserId ? colors.primary : colors.border
                        }
                    ]}
                    onPress={() => onSelect(null)}
                >
                    <Text style={[
                        styles.chipText,
                        { color: !selectedUserId ? colors.textInverse : colors.subText }
                    ]}>
                        Tümü
                    </Text>
                </TouchableOpacity>

                {users.map((user) => (
                    <TouchableOpacity
                        key={user.id}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: selectedUserId === user.id ? colors.primary : colors.surface,
                                borderColor: selectedUserId === user.id ? colors.primary : colors.border
                            }
                        ]}
                        onPress={() => onSelect(user.id)}
                    >
                        <Text style={[
                            styles.chipText,
                            { color: selectedUserId === user.id ? colors.textInverse : colors.subText }
                        ]}>
                            {user.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        marginLeft: 20,
        marginBottom: 4,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
    },
});

export default UserFilter;
