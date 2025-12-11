import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTeamManagement } from '../../hooks/useTeamManagement';
import CustomButton from '../../components/CustomButton';
import TeamCard from '../../components/manager/TeamCard';
import MemberCard from '../../components/manager/MemberCard';
import TeamFormModal from '../../components/manager/TeamFormModal';

export default function TeamListScreen({ navigation }) {
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
            Alert.alert('Hata', 'Ekip adı zorunludur.');
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
                        renderItem={({ item }) => (
                            <TeamCard
                                item={item}
                                onEdit={handleEditTeam}
                                onDelete={handleDeleteTeam}
                                isAdmin={isAdmin}
                            />
                        )}
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
                    renderItem={({ item }) => <MemberCard item={item} />}
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

            <TeamFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={editingTeam}
                onSave={handleSaveTeam}
                availableUsers={availableUsers}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ekibi Sil</Text>
                        <Text style={styles.deleteConfirmationText}>
                            "{teamToDelete?.name}" ekibini silmek istediğinizden emin misiniz?
                        </Text>
                        <Text style={styles.deleteWarningText}>
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
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title="Sil"
                                onPress={confirmDelete}
                                variant="primary"
                                style={{ flex: 1, backgroundColor: COLORS.error || '#FF4444' }}
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
    emptyText: {
        color: COLORS.slate400,
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
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    deleteConfirmationText: {
        color: COLORS.textLight,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 12,
    },
    deleteWarningText: {
        color: COLORS.slate400,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
});
