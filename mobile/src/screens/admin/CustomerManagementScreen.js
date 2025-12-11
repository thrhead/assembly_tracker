import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useCustomerManagement } from '../../hooks/useCustomerManagement';
import CustomerListItem from '../../components/admin/CustomerListItem';
import CustomerFormModal from '../../components/admin/CustomerFormModal';

export default function CustomerManagementScreen({ navigation }) {
    const {
        filteredCustomers,
        loading,
        refreshing,
        searchQuery,
        setSearchQuery,
        loadCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        setRefreshing
    } = useCustomerManagement();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const onRefresh = () => {
        setRefreshing(true);
        loadCustomers();
    };

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setModalVisible(true);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setModalVisible(true);
    };

    const handleSaveCustomer = async (formData) => {
        if (!formData.companyName || !formData.contactPerson || !formData.email) {
            Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
            return;
        }

        if (!formData.email.includes('@')) {
            Alert.alert('Hata', 'Geçerli bir email adresi girin.');
            return;
        }

        let success = false;
        if (editingCustomer) {
            success = await updateCustomer(editingCustomer.id, formData);
        } else {
            success = await addCustomer(formData);
        }

        if (success) {
            setModalVisible(false);
        }
    };

    const handleDeleteCustomer = (customer) => {
        Alert.alert(
            'Müşteriyi Sil',
            `${customer.companyName} müşterisini silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => deleteCustomer(customer.id)
                }
            ]
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="business-center" size={48} color={COLORS.slate600} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>Müşteri bulunamadı</Text>
            <Text style={styles.emptyText}>
                {searchQuery ? 'Arama kriterlerinize uygun müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Müşteriler yükleniyor...</Text>
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
                        placeholder="Müşteri ara..."
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
            </View>

            <FlatList
                data={filteredCustomers}
                renderItem={({ item }) => (
                    <CustomerListItem
                        item={item}
                        onEdit={handleEditCustomer}
                        onDelete={handleDeleteCustomer}
                    />
                )}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                style={{ flex: 1 }}
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

            <TouchableOpacity style={styles.fab} onPress={handleAddCustomer} activeOpacity={0.8}>
                <MaterialIcons name="add" size={32} color={COLORS.black} />
            </TouchableOpacity>

            <CustomerFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={editingCustomer}
                onSave={handleSaveCustomer}
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
    listContainer: {
        padding: 16,
        paddingBottom: 80,
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
});
