import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import teamService from '../../services/team.service';
import userService from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

export default function TeamListScreen({ navigation }) {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', leadId: '', memberIds: [] });
    const [availableUsers, setAvailableUsers] = useState([]);

    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [teamsData, usersData] = await Promise.all([
                teamService.getAll(),
                isAdmin ? userService.getAll() : Promise.resolve([])
            ]);

            setTeams(teamsData);
            if (isAdmin) {
                setAvailableUsers(usersData);
            }

            if (!isAdmin) {
                let targetTeam = teamsData.find(t => t.leadId === user.id);
                if (!targetTeam) {
                    targetTeam = teamsData.find(t => t.members.some(m => m.userId === user.id));
                }
                setMembers(targetTeam ? targetTeam.members : []);
            }

            console.log('DEBUG_TEAMS_DATA:', JSON.stringify(teamsData, null, 2));
            console.log('DEBUG_USER_ROLE:', user?.role);
            console.log('DEBUG_IS_ADMIN:', isAdmin);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Hata', 'Veriler yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleAddTeam = () => {
        setEditingTeam(null);
        setFormData({ name: '', description: '', leadId: '', memberIds: [] });
        setModalVisible(true);
    };

    const handleEditTeam = (team) => {
        setEditingTeam(team);
        setFormData({
            name: team.name,
            description: team.description || '',
            leadId: team.leadId || '',
            memberIds: team.members?.map(m => m.userId) || []
        });
        setModalVisible(true);
    };

    const handleSaveTeam = async () => {
        if (!formData.name) {
            Alert.alert('Hata', 'Ekip adı zorunludur.');
            return;
        }

        try {
            if (editingTeam) {
                await teamService.update(editingTeam.id, formData);
                Alert.alert('Başarılı', 'Ekip güncellendi.');
            } else {
                await teamService.create(formData);
                Alert.alert('Başarılı', 'Yeni ekip oluşturuldu.');
            }
            setModalVisible(false);
            loadData();
        } catch (error) {
            console.error('Save team error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
        }
    };

    const renderTeamCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.teamIcon}>
                    <MaterialIcons name="groups" size={24} color={COLORS.black} />
                </View>
                <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{item.name}</Text>
                    {item.description && (
                        <Text style={styles.teamDescription}>{item.description}</Text>
                    )}
                </View>
                {isAdmin && (
                    <TouchableOpacity onPress={() => handleEditTeam(item)} style={styles.editIcon}>
                        <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Team Lead */}
            <View style={styles.teamSection}>
                <Text style={styles.sectionTitle}>Ekip Lideri:</Text>
                <Text style={styles.sectionText}>
                    {item.lead?.name || 'Atanmamış'}
                </Text>
            </View>

            {/* Team Members */}
            <View style={styles.teamSection}>
                <Text style={styles.sectionTitle}>Ekip Üyeleri ({item.members?.length || 0}):</Text>
                {item.members && item.members.length > 0 ? (
                    <View style={styles.membersList}>
                        {item.members.map((member) => (
                            <Text key={member.id} style={styles.memberItem}>
                                • {member.user.name} ({member.user.role === 'WORKER' ? 'İşçi' : 'Ekip Lideri'})
                            </Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyMembersText}>Henüz üye eklenmemiş</Text>
                )}
            </View>
        </View>
    );

    const renderMember = ({ item }) => (
        <View style={styles.memberCard}>
            <View style={styles.memberHeader}>
                <View style={[
                    styles.avatar,
                    { backgroundColor: item.user.isActive ? COLORS.primary : COLORS.slate400 }
                ]}>
                    <Text style={styles.avatarText}>
                        {item.user.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{item.user.name}</Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.user.isActive ? 'rgba(204, 255, 4, 0.2)' : COLORS.slate700 }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.user.isActive ? COLORS.primary : COLORS.slate400 }
                            ]}>
                                {item.user.isActive ? 'Aktif' : 'Pasif'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.memberEmail}>{item.user.email}</Text>
                    <Text style={styles.memberRole}>{item.user.role}</Text>
                </View>
            </View>
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
            {isAdmin ? (
                <>
                    <FlatList
                        data={teams}
                        renderItem={renderTeamCard}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        style={{ flex: 1 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                    />
                    <TouchableOpacity style={styles.fab} onPress={handleAddTeam} activeOpacity={0.8}>
                        <MaterialIcons name="add" size={32} color={COLORS.black} />
                    </TouchableOpacity>
                </>
            ) : (
                <FlatList
                    data={members}
                    renderItem={renderMember}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    style={{ flex: 1 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>Ekip bulunamadı.</Text>
                        </View>
                    }
                />
            )}

            {/* Add/Edit Team Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingTeam ? 'Ekibi Düzenle' : 'Yeni Ekip Ekle'}</Text>

                        <CustomInput
                            label="Ekip Adı *"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Montaj Ekibi A"
                        />

                        <CustomInput
                            label="Açıklama"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Ekip açıklaması (opsiyonel)"
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                        />

                        <Text style={styles.label}>Ekip Lideri</Text>
                        <View style={styles.selectionBox}>
                            {availableUsers.filter(u => u.role === 'TEAM_LEAD' || u.role === 'MANAGER').map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={styles.checkboxItem}
                                    onPress={() => setFormData({ ...formData, leadId: formData.leadId === u.id ? '' : u.id })}
                                >
                                    <View style={[styles.checkbox, formData.leadId === u.id && styles.checkboxChecked]}>
                                        {formData.leadId === u.id && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{u.name} ({u.role === 'TEAM_LEAD' ? 'Ekip Lideri' : 'Yönetici'})</Text>
                                </TouchableOpacity>
                            ))}
                            {availableUsers.filter(u => u.role === 'TEAM_LEAD' || u.role === 'MANAGER').length === 0 && (
                                <Text style={styles.emptyText}>Henüz ekip lideri veya yönetici yok</Text>
                            )}
                        </View>

                        <Text style={styles.label}>Ekip Üyeleri</Text>
                        <View style={styles.selectionBox}>
                            {availableUsers.filter(u => u.role === 'WORKER' || u.role === 'TEAM_LEAD').map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={styles.checkboxItem}
                                    onPress={() => {
                                        const isSelected = formData.memberIds?.includes(u.id);
                                        setFormData({
                                            ...formData,
                                            memberIds: isSelected
                                                ? formData.memberIds.filter(id => id !== u.id)
                                                : [...(formData.memberIds || []), u.id]
                                        });
                                    }}
                                >
                                    <View style={[styles.checkbox, formData.memberIds?.includes(u.id) && styles.checkboxChecked]}>
                                        {formData.memberIds?.includes(u.id) && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{u.name} ({u.role === 'WORKER' ? 'İşçi' : 'Ekip Lideri'})</Text>
                                </TouchableOpacity>
                            ))}
                            {availableUsers.filter(u => u.role === 'WORKER' || u.role === 'TEAM_LEAD').length === 0 && (
                                <Text style={styles.emptyText}>Henüz işçi yok</Text>
                            )}
                        </View>

                        <View style={styles.modalButtons}>
                            <CustomButton
                                title="İptal"
                                onPress={() => setModalVisible(false)}
                                variant="outline"
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title="Kaydet"
                                onPress={handleSaveTeam}
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    teamDescription: {
        fontSize: 13,
        color: COLORS.slate400,
        fontStyle: 'italic',
    },
    teamSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 6,
    },
    sectionText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    membersList: {
        marginTop: 4,
    },
    memberItem: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
        paddingLeft: 8,
    },
    emptyMembersText: {
        fontSize: 14,
        color: COLORS.slate400,
        fontStyle: 'italic',
    },
    editIcon: {
        padding: 8,
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
        backgroundColor: 'rgba(0,0,0,0.8)',
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
        color: COLORS.textLight,
        marginBottom: 8,
        fontWeight: '600',
    },
    selectionBox: {
        backgroundColor: COLORS.slate800,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.slate600,
        padding: 12,
        marginBottom: 16,
        maxHeight: 200,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.slate500,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxChecked: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    checkmark: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        color: COLORS.textLight,
        fontSize: 14,
        flex: 1,
    },
    emptyText: {
        color: COLORS.slate400,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    memberCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    memberHeader: {
        flexDirection: 'row',
        marginBottom: 0,
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
        color: COLORS.black,
    },
    memberInfo: {
        flex: 1,
    },
    memberNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    memberEmail: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    memberRole: {
        fontSize: 12,
        color: COLORS.slate400,
        marginTop: 2,
    },
});
