import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import userService from '../../services/user.service';

export default function UserManagementScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'WORKER', password: '' });

    const roleFilters = [
        { key: 'ALL', label: 'Tümü' },
        { key: 'ADMIN', label: 'Admin' },
        { key: 'MANAGER', label: 'Manager' },
        { key: 'WORKER', label: 'Worker' },
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, selectedFilter, users]);

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Hata', 'Kullanıcılar yüklenemedi.');
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    const filterUsers = () => {
        let filtered = users;

        // Role filter
        if (selectedFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === selectedFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(filtered);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'WORKER', password: '' });
        setModalVisible(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
        setModalVisible(true);
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
                    onPress: async () => {
                        try {
                            await userService.delete(user.id);
                            Alert.alert('Başarılı', 'Kullanıcı silindi.');
                            loadUsers();
                        } catch (error) {
                            console.error('Delete user error:', error);
                            Alert.alert('Hata', 'Kullanıcı silinemedi.');
                        }
                    }
                }
            ]
        );
    };

    const handleSaveUser = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!formData.email.includes('@')) {
            Alert.alert('Hata', 'Geçerli bir email adresi girin.');
            return;
        }

        try {
            if (editingUser) {
                // Update existing user
                await userService.update(editingUser.id, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    ...(formData.password ? { password: formData.password } : {})
                });
                Alert.alert('Başarılı', 'Kullanıcı güncellendi.');
            } else {
                // Add new user
                await userService.create(formData);
                Alert.alert('Başarılı', 'Yeni kullanıcı eklendi.');
            }
            setModalVisible(false);
            loadUsers();
        } catch (error) {
            console.error('Save user error:', error);
            Alert.alert('Hata', error.response?.data?.error || 'İşlem başarısız.');
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN':
                return { color: '#EF4444', text: 'Admin' };
            case 'MANAGER':
                return { color: '#F59E0B', text: 'Manager' };
            case 'WORKER':
                return { color: '#3B82F6', text: 'Worker' };
            default:
                return { color: '#6B7280', text: role };
        }
    };

    const renderUser = ({ item }) => {
        const badge = getRoleBadge(item.role);

        return (
            <View style={styles.userCard}>
                <View style={styles.userHeader}>
                    <View style={[styles.avatar, { backgroundColor: badge.color }]}>
                        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: badge.color }]}>
                            <Text style={styles.roleText}>{badge.text}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.userActions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditUser(item)}
                    >
                        <Text style={styles.editButtonText}>✏️ Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteUser(item)}
                    >
                        <Text style={styles.deleteButtonText}>🗑️ Sil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>Kullanıcı bulunamadı</Text>
            <Text style={styles.emptyText}>
                {searchQuery ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#EF4444" />
                <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Kullanıcı ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Role Filter Tabs */}
                <View style={styles.filtersContainer}>
                    {roleFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter.key && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedFilter(filter.key)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                selectedFilter === filter.key && styles.filterChipTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#EF4444']}
                        tintColor="#EF4444"
                    />
                }
            />

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.fab} onPress={handleAddUser}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>

            {/* Add/Edit User Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>
                                {editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
                            </Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>İsim Soyisim *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ali Yılmaz"
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ali@montaj.com"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Şifre {editingUser ? '(Boş bırakılırsa değişmez)' : '*'}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={editingUser ? "Yeni şifre" : "Şifre"}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Rol *</Text>
                                <View style={styles.roleButtons}>
                                    {['WORKER', 'MANAGER', 'ADMIN'].map((role) => (
                                        <TouchableOpacity
                                            key={role}
                                            style={[
                                                styles.roleButton,
                                                formData.role === role && styles.roleButtonActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, role })}
                                        >
                                            <Text style={[
                                                styles.roleButtonText,
                                                formData.role === role && styles.roleButtonTextActive
                                            ]}>
                                                {role === 'WORKER' ? 'Worker' : role === 'MANAGER' ? 'Manager' : 'Admin'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveUser}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {editingUser ? 'Güncelle' : 'Ekle'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#010100',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#94a3b8',
    },
    headerContainer: {
        backgroundColor: '#1A1A1A',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3748',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
        color: '#94a3b8',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#ffffff',
    },
    clearIcon: {
        fontSize: 18,
        color: '#94a3b8',
        padding: 4,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#2d3748',
    },
    filterChipActive: {
        backgroundColor: '#EF4444',
    },
    filterChipText: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    userCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    userHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 6,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    userActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 12,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        padding: 10,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#2d3748',
        borderWidth: 1,
        borderColor: '#4b5563',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#ffffff',
    },
    roleButtons: {
        flexDirection: 'row',
    },
    roleButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#2d3748',
        marginRight: 8,
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: '#EF4444',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
    },
    roleButtonTextActive: {
        color: '#fff',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#334155',
        padding: 16,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e2e8f0',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
