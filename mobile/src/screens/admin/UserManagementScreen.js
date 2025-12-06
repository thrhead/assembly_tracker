import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import userService from '../../services/user.service';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';
import { API_BASE_URL } from '../../services/api';

const { height } = Dimensions.get('window');

export default function UserManagementScreen({ navigation, route }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'WORKER', password: '' });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (route.params?.openCreate) {
            handleAddUser();
            navigation.setParams({ openCreate: false });
        }
    }, [route.params]);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, activeTab, users]);

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

        if (activeTab !== 'ALL') {
            filtered = filtered.filter(user => user.role === activeTab);
        }

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
        if (!formData.name || !formData.email || !formData.role) {
            Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        try {
            if (editingUser) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await userService.update(editingUser.id, updateData);
                Alert.alert('Başarılı', 'Kullanıcı güncellendi.');
            } else {
                if (!formData.password) {
                    Alert.alert('Hata', 'Yeni kullanıcı için şifre zorunludur.');
                    return;
                }
                await userService.create(formData);
                Alert.alert('Başarılı', 'Kullanıcı oluşturuldu.');
            }
            setModalVisible(false);
            loadUsers();
        } catch (error) {
            console.error('Save user error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
        }
    };

    const renderHeader = () => (
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

            {/* Role Tabs */}
            <View style={styles.tabsContainer}>
                {['ALL', 'ADMIN', 'MANAGER', 'WORKER'].map((role) => (
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

    const renderUser = (item) => (
        <View key={item.id} style={styles.userCard}>
            <View style={styles.userIcon}>
                <Text style={styles.userIconText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.roleContainer}>
                    <Text style={styles.userRole}>{item.role}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEditUser(item)} style={styles.actionButton}>
                    <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteUser(item)} style={styles.actionButton}>
                    <MaterialIcons name="delete" size={20} color={COLORS.red500} />
                </TouchableOpacity>
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
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={true}
            >
                {filteredUsers.length === 0 ? (
                    renderEmptyState()
                ) : (
                    filteredUsers.map(item => renderUser(item))
                )}
            </ScrollView>

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddUser}
                activeOpacity={0.8}
            >
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
                        <Text style={styles.modalTitle}>{editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</Text>

                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                            <CustomInput
                                label="Ad Soyad *"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Ahmet Yılmaz"
                            />

                            <CustomInput
                                label="E-posta *"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="ornek@email.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {!editingUser && (
                                <CustomInput
                                    label="Şifre *"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    placeholder="******"
                                    secureTextEntry
                                />
                            )}

                            <Text style={styles.label}>Rol</Text>
                            <View style={styles.roleSelector}>
                                {['WORKER', 'TEAM_LEAD', 'MANAGER', 'ADMIN'].map((role) => (
                                    <TouchableOpacity
                                        key={role}
                                        style={[
                                            styles.roleOption,
                                            formData.role === role && styles.activeRoleOption
                                        ]}
                                        onPress={() => setFormData({ ...formData, role })}
                                    >
                                        <Text style={[
                                            styles.roleOptionText,
                                            formData.role === role && styles.activeRoleOptionText
                                        ]}>
                                            {role}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <CustomButton
                                title="İptal"
                                onPress={() => setModalVisible(false)}
                                variant="outline"
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title="Kaydet"
                                onPress={handleSaveUser}
                                variant="primary"
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
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
        // Removed paddingBottom here as we use ListFooterComponent
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    userIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.slate800,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: COLORS.slate700,
    },
    userIconText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
        color: COLORS.slate400,
        marginBottom: 4,
    },
    roleContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    userRole: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
        marginTop: 8,
    },
    roleSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    roleOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.slate800,
        borderWidth: 1,
        borderColor: COLORS.slate700,
    },
    activeRoleOption: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    roleOptionText: {
        fontSize: 12,
        color: COLORS.slate400,
    },
    activeRoleOptionText: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
});
