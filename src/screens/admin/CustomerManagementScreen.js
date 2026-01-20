import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Modal, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useCustomerManagement } from '../../hooks/useCustomerManagement';
import CustomerListItem from '../../components/admin/CustomerListItem';
import CustomerFormModal from '../../components/admin/CustomerFormModal';

export default function CustomerManagementScreen({ navigation, route }) {
    const { theme, isDark } = useTheme();
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

    useEffect(() => {
        if (route.params?.openCreate) {
            handleAddCustomer();
            // Clear the param so it doesn't reopen on every navigation back
            navigation.setParams({ openCreate: undefined });
        }
    }, [route.params?.openCreate]);

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
            <MaterialIcons name="business-center" size={48} color={theme.colors.subText} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Müşteri bulunamadı</Text>
            <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                {searchQuery ? 'Arama kriterlerinize uygun müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
            </Text>
        </View>
    );

    const renderItem = React.useCallback(({ item }) => (
        <CustomerListItem
            item={item}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            theme={theme}
        />
    ), [handleEditCustomer, handleDeleteCustomer, theme]);

    const renderHeader = React.useCallback(() => (
        <View style={[styles.headerContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <MaterialIcons name="search" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text }]}
                    placeholder="Müşteri ara..."
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
        </View>
    ), [theme, searchQuery, setSearchQuery]);

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.subText }]}>Müşteriler yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={filteredCustomers}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={[styles.listContainer, { flexGrow: 1 }]}
                style={{ flex: 1 }}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddCustomer}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={32} color={theme.colors.textInverse} />
            </TouchableOpacity>

            <CustomerFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialData={editingCustomer}
                onSave={handleSaveCustomer}
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
    loadingText: {
        marginTop: 10,
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
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
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
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
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
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
});
