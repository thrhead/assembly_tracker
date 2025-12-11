import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useUserManagement } from '../../hooks/useUserManagement';
import UserListItem from '../../components/admin/UserListItem';
import UserFormModal from '../../components/admin/UserFormModal';

export default function UserManagementScreen({ navigation, route }) {
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
        <View style={styles.headerContainer}>
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Kullanıcı ara..."
                    placeholderTextColor={COLORS.slate400}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <MaterialIcons name="close" size={20} color={COLORS.slate400} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.tabsContainer}>
                {['ALL', 'ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER'].map((role) => (
                    <TouchableOpacity
                        key={role}
                        style={[
                            styles.tab,
                            activeTab === role && styles.activeTab
                        ]}
                        onPress={() => setActiveTab(role)}
                    >
                        <Text style={[
                            styles.tabText,
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
            <MaterialIcons name="person-off" size={64} color={COLORS.slate600} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>Kullanıcı Bulunamadı</Text>
            <Text style={styles.emptyText}>
                {searchQuery ? 'Arama kriterlerinize uygun kullanıcı yok.' : 'Henüz kullanıcı eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            <FlatList
                data={filteredUsers}
                renderItem={({ item }) => (
                    <UserListItem
                        item={item}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={renderEmptyState}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddUser}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={32} color={COLORS.black} />
            </TouchableOpacity>

            <UserFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={editingUser}
                onSave={handleSaveUser}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: COLORS.cardDark,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.slate800,
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
        color: COLORS.textLight,
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
        backgroundColor: COLORS.slate800,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.slate400,
    },
    activeTabText: {
        color: COLORS.black,
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
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
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
        color: COLORS.textLight,
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.slate500,
        textAlign: 'center',
        marginTop: 8,
    },
});
