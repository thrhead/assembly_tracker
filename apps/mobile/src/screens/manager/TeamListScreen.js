import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useTeamManagement } from '../../hooks/useTeamManagement';
import CustomButton from '../../components/CustomButton';
import TeamCard from '../../components/manager/TeamCard';
import MemberCard from '../../components/manager/MemberCard';
import TeamFormModal from '../../components/manager/TeamFormModal';
import { useAlert } from '../../context/AlertContext';

export default function TeamListScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const { showAlert } = useAlert();
    const {
        teams,
        members,
        availableUsers,
        loading,
        refreshing,
        isAdmin,
        onRefresh,
        createTeam,
        updateTeam,
        deleteTeam
    } = useTeamManagement();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    const handleAddTeam = () => {
        setEditingTeam(null);
        setModalVisible(true);
    };

    const handleEditTeam = (team) => {
        setEditingTeam(team);
        setModalVisible(true);
    };

    const handleDeleteTeam = (team) => {
        setTeamToDelete(team);
        setDeleteModalVisible(true);
    };

    const handleSaveTeam = async (formData) => {
        if (!formData.name) {
            showAlert('Hata', 'Ekip adı zorunludur.', [], 'error');
            return;
        }

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

    const renderTeamItem = React.useCallback(({ item }) => (
        <TeamCard
            item={item}
            onEdit={handleEditTeam}
            onDelete={handleDeleteTeam}
            isAdmin={isAdmin}
            theme={theme}
        />
    ), [handleEditTeam, handleDeleteTeam, isAdmin, theme]);

    const renderMemberItem = React.useCallback(({ item }) => (
        <MemberCard item={item} theme={theme} />
    ), [theme]);

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {isAdmin ? (
                <>
                    <FlatList
                        data={teams}
                        renderItem={renderTeamItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={[styles.listContainer, { flexGrow: 1, paddingBottom: 100 }]}
                        style={{ flex: 1 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={Platform.OS === 'android'}
                    />
                    <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={handleAddTeam} activeOpacity={0.8}>
                        <MaterialIcons name="add" size={32} color={theme.colors.textInverse} />
                    </TouchableOpacity>
                </>
            ) : (
                <FlatList
                    data={members}
                    renderItem={renderMemberItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContainer, { flexGrow: 1, paddingBottom: 20 }]}
                    style={{ flex: 1 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>Ekip bulunamadı.</Text>
                        </View>
                    }
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
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
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Ekibi Sil</Text>
                        <Text style={[styles.deleteConfirmationText, { color: theme.colors.text }]}>
                            &quot;{teamToDelete?.name}&quot; ekibini silmek istediğinizden emin misiniz?
                        </Text>
                        <Text style={[styles.deleteWarningText, { color: theme.colors.subText }]}>
                            Bu işlem geri alınamaz.
                        </Text>

                        <View style={styles.modalButtons}>
                            <CustomButton
                                title="İptal"
                                onPress={() => {
                                    setDeleteModalVisible(false);
                                    setTeamToDelete(null);
                                }}
                                variant="outline"
                                style={{ flex: 1, borderColor: theme.colors.border }}
                                textStyle={{ color: theme.colors.text }}
                            />
                            <CustomButton
                                title="Sil"
                                onPress={confirmDelete}
                                variant="primary"
                                style={{ flex: 1, backgroundColor: theme.colors.error }}
                                textStyle={{ color: theme.colors.textInverse }}
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
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    deleteConfirmationText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 12,
    },
    deleteWarningText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
});
