import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal,
    Platform
} from 'react-native';
import { Users, ChevronRight, Circle, Briefcase, Search, Plus, Trash2, Edit3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useTeamManagement } from '../../hooks/useTeamManagement';
import TeamFormModal from '../../components/manager/TeamFormModal';
import CustomButton from '../../components/CustomButton';

const TeamManagementScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const {
        teams,
        availableUsers,
        loading,
        refreshing,
        isAdmin,
        onRefresh,
        createTeam,
        updateTeam,
        deleteTeam
    } = useTeamManagement();

    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    const filteredTeams = useMemo(() => {
        return teams.filter(team =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teams, searchQuery]);

    const stats = useMemo(() => {
        const total = teams.length;
        const busy = teams.filter(t => t.status === 'BUSY').length;
        const available = total - busy;
        return { total, busy, available };
    }, [teams]);

    const handleAddTeam = () => {
        setEditingTeam(null);
        setModalVisible(true);
    };

    const handleEditTeam = (team) => {
        setEditingTeam(team);
        setModalVisible(true);
    };

    const handleDeletePress = (team) => {
        setTeamToDelete(team);
        setDeleteModalVisible(true);
    };

    const handleSaveTeam = async (formData) => {
        let success = false;
        if (editingTeam) {
            success = await updateTeam(editingTeam.id, formData);
        } else {
            success = await createTeam(formData);
        }

        if (success) {
            setModalVisible(false);
        }
    };

    const confirmDelete = async () => {
        if (!teamToDelete) return;
        const success = await deleteTeam(teamToDelete.id);
        if (success) {
            setDeleteModalVisible(false);
            setTeamToDelete(null);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.total}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{t('manager.total')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.statValue, { color: '#22C55E' }]}>{stats.available}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{t('manager.available')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.busy}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{t('manager.busy')}</Text>
                </View>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                <Search size={20} color={theme.colors.subText} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text }]}
                    placeholder={t('manager.searchTeam')}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const renderTeamItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <TouchableOpacity
                style={styles.cardContent}
                onPress={() => navigation.navigate('TeamDetail', { teamId: item.id, teamName: item.name })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.titleGroup}>
                        <Users size={20} color={theme.colors.primary} style={styles.icon} />
                        <Text style={[styles.teamName, { color: theme.colors.text }]}>{item.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'BUSY' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }]}>
                        <Circle size={8} fill={item.status === 'BUSY' ? '#EF4444' : '#22C55E'} color={item.status === 'BUSY' ? '#EF4444' : '#22C55E'} />
                        <Text style={[styles.statusText, { color: item.status === 'BUSY' ? '#EF4444' : '#22C55E' }]}>
                            {item.status === 'BUSY' ? t('manager.busy') : t('manager.available')}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.statRow}>
                        <Users size={16} color={theme.colors.subText} />
                        <Text style={[styles.statText, { color: theme.colors.subText }]}>
                            {t('manager.memberCount', { count: item.memberCount || item.members?.length || 0 })}
                        </Text>
                    </View>

                    {item.lead && (
                        <View style={styles.statRow}>
                            <Text style={[styles.statText, { color: theme.colors.subText }]}>
                                {t('manager.teamLeader')}: {item.lead.name}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {isAdmin && (
                <View style={[styles.actions, { borderTopColor: theme.colors.cardBorder }]}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleEditTeam(item)}>
                        <Edit3 size={18} color={theme.colors.primary} />
                        <Text style={[styles.actionText, { color: theme.colors.primary }]}>{t('common.edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDeletePress(item)}>
                        <Trash2 size={18} color={theme.colors.error} />
                        <Text style={[styles.actionText, { color: theme.colors.error }]}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={filteredTeams}
                renderItem={renderTeamItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>{t('common.search')}</Text>
                    </View>
                }
            />

            {isAdmin && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={handleAddTeam}
                >
                    <Plus size={24} color={isDark ? '#000' : '#FFF'} />
                </TouchableOpacity>
            )}

            <TeamFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={editingTeam}
                onSave={handleSaveTeam}
                availableUsers={availableUsers}
                theme={theme}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('common.delete')}</Text>
                        <Text style={[styles.deleteText, { color: theme.colors.text }]}>
                            {teamToDelete?.name} {t('profile.logoutConfirmDesc').includes('?') ? '?' : ''}
                        </Text>
                        <View style={styles.modalButtons}>
                            <CustomButton
                                title={t('common.cancel')}
                                onPress={() => setDeleteModalVisible(false)}
                                variant="outline"
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title={t('common.delete')}
                                onPress={confirmDelete}
                                variant="primary"
                                style={{ flex: 1, backgroundColor: theme.colors.error }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 16 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 12, marginTop: 4 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        height: 48,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: { padding: 16 },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    icon: { marginRight: 2 },
    teamName: { fontSize: 18, fontWeight: 'bold' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    statusText: { fontSize: 12, fontWeight: '700' },
    cardBody: { gap: 8 },
    statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statText: { fontSize: 14 },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingVertical: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    actionText: { fontSize: 14, fontWeight: '600' },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 16, fontStyle: 'italic' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    deleteText: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
    modalButtons: { flexDirection: 'row', gap: 12 },
});

export default TeamManagementScreen;