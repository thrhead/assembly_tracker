import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useUserManagement } from '../../hooks/useUserManagement';
import UserListItem from '../../components/admin/UserListItem';
import UserFormModal from '../../components/admin/UserFormModal';

export default function UserManagementScreen({ navigation, route }) {
    const { theme, isDark } = useTheme();
    const {
        filteredUsers,
        loading,
        refreshing,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        addUser,
        updateUser,
        deleteUser,
        setRefreshing,
        loadUsers
    } = useUserManagement();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        if (route.params?.openCreate) {
            handleAddUser();
            navigation.setParams({ openCreate: false });
        }
    }, [route.params]);

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setModalVisible(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setModalVisible(true);
    };

    const handleSaveUser = async (formData) => {
        let success = false;
        if (editingUser) {
            success = await updateUser(editingUser.id, formData);
        } else {
            success = await addUser(formData);
        }
        if (success) {
            setModalVisible(false);
        }
    };

    const handleDeleteUser = (user) => {
        Alert.alert(
            'Kullanıcıyı Sil',
            `${user.name} kullanıcısını silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => deleteUser(user.id)
                }
            ]
        );
    };

    const renderHeader = () => (
        <View style={[styles.headerContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
                <MaterialIcons name="search" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text }]}
                    placeholder="Kullanıcı ara..."
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <MaterialIcons name="close" size={20} color={theme.colors.subText} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.tabsContainer}>
                {['ALL', 'ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER', 'CUSTOMER'].map((role) => (
                    <TouchableOpacity
                        key={role}
                        style={[
                            styles.tab,
                            { backgroundColor: activeTab === role ? theme.colors.primary : theme.colors.background },
                            activeTab === role && styles.activeTab
                        ]}
                        onPress={() => setActiveTab(role)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === role ? theme.colors.textInverse : theme.colors.subText },
                            activeTab === role && styles.activeTabText
                        ]}>
                            {role === 'ALL' ? 'Tümü' : role}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="person-off" size={64} color={theme.colors.subText} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Kullanıcı Bulunamadı</Text>
            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                {searchQuery ? 'Arama kriterlerinize uygun kullanıcı yok.' : 'Henüz kullanıcı eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {renderHeader()}
            <FlatList
                style={{ flex: 1 }}
                data={filteredUsers}
                renderItem={({ item }) => (
                    <UserListItem
                        item={item}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        theme={theme}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.listContainer, { flexGrow: 1 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={renderEmptyState}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                onPress={handleAddUser}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={32} color={theme.colors.textInverse} />
            </TouchableOpacity>

            <UserFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={editingUser}
                onSave={handleSaveUser}
                theme={theme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    activeTab: {
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeTabText: {
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    fab: {
        position: 'absolute',
        bottom: 50,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
});
