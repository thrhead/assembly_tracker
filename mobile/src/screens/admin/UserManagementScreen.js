import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';

import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Alert, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import userService from '../../services/user.service';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

export default function UserManagementScreen({ navigation, route }) {
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
        if (route.params?.openCreate) {
            handleAddUser();
            navigation.setParams({ openCreate: undefined });
        }
    }, [route.params]);

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

    const [saving, setSaving] = useState(false);

    const handleSaveUser = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!formData.email.includes('@')) {
            Alert.alert('Hata', 'Geçerli bir email adresi girin.');
            return;
        }

        setSaving(true);
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
            const errorMessage = error.response?.data?.error || error.message || 'İşlem başarısız.';
            Alert.alert('Hata', errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN':
                return { color: COLORS.red500, text: 'Admin' };
            case 'MANAGER':
                return { color: COLORS.amber500, text: 'Manager' };
            case 'TEAM_LEAD':
                return { color: COLORS.green500, text: 'Ekip Lideri' };
            case 'WORKER':
                return { color: COLORS.blue500, text: 'Worker' };
            default:
                return { color: COLORS.slate600, text: role };
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
                    <CustomButton
                        title="Düzenle"
                        onPress={() => handleEditUser(item)}
                        variant="ghost"
                        icon={<MaterialIcons name="edit" size={18} color={COLORS.primary} />}
                        style={{ flex: 1, marginRight: 8, height: 40 }}
                        textStyle={{ fontSize: 14, color: COLORS.primary }}
                    />
                    <CustomButton
                        title="Sil"
                        onPress={() => handleDeleteUser(item)}
                        variant="ghost"
                        icon={<MaterialIcons name="delete" size={18} color={COLORS.red500} />}
                        style={{ flex: 1, height: 40 }}
                        textStyle={{ fontSize: 14, color: COLORS.red500 }}
                    />
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="person-off" size={48} color={COLORS.slate600} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>Kullanıcı bulunamadı</Text>
            <Text style={styles.emptyText}>
                {searchQuery ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* Search Bar */}
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

                {/* Role Filter Tabs */}
                <View style={styles.filtersContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                    </ScrollView>
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
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            />

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.fab} onPress={handleAddUser} activeOpacity={0.8}>
                <MaterialIcons name="add" size={32} color={COLORS.black} />
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

                            <CustomInput
                                label="İsim Soyisim *"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Ali Yılmaz"
                            />

                            <CustomInput
                                label="Email *"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="ali@montaj.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <CustomInput
                                label={`Şifre ${editingUser ? '(Boş bırakılırsa değişmez)' : '*'}`}
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                placeholder={editingUser ? "Yeni şifre" : "Şifre"}
                                secureTextEntry
                            />

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Rol *</Text>
                                <View style={styles.roleButtons}>
                                    {['WORKER', 'TEAM_LEAD', 'MANAGER', 'ADMIN'].map((role) => {
                                        const roleLabels = {
                                            'WORKER': 'İşçi',
                                            'TEAM_LEAD': 'Ekip Lideri',
                                            'MANAGER': 'Yönetici',
                                            'ADMIN': 'Admin'
                                        };
                                        return (
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
                                                    {roleLabels[role]}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <CustomButton
                                    title="İptal"
                                    onPress={() => setModalVisible(false)}
                                    variant="outline"
                                    style={{ flex: 1 }}
                                />
                                <CustomButton
                                    title={editingUser ? 'Güncelle' : 'Ekle'}
                                    onPress={handleSaveUser}
                                    variant="primary"
                                    style={{ flex: 1 }}
                                    loading={saving}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <View style={{ padding: 10, alignItems: 'center', backgroundColor: COLORS.cardDark }}>
                <Text style={{ color: COLORS.slate500, fontSize: 10 }}>API: {API_BASE_URL}</Text>
            </View>
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
    loadingText: {
        marginTop: 10,
        color: COLORS.slate400,
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
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: COLORS.slate800,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
    },
    filterChipText: {
        fontSize: 14,
        color: COLORS.slate400,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: COLORS.black,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    userCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
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
        color: COLORS.textLight,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.slate400,
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
        borderTopColor: COLORS.slate800,
        paddingTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.slate400,
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
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.cardDark,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
    },
    roleButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleButton: {
        flex: 1,
        minWidth: '45%',
        padding: 12,
        borderRadius: 8,
        backgroundColor: COLORS.slate800,
        alignItems: 'center',
        marginBottom: 8,
    },
    roleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slate400,
    },
    roleButtonTextActive: {
        color: COLORS.black,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
});
