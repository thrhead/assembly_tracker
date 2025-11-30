import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Modal, Alert, ScrollView } from 'react-native';
import customerService from '../../services/customer.service';

export default function CustomerManagementScreen({ navigation }) {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        filterCustomers();
    }, [searchQuery, customers]);

    const loadCustomers = async () => {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error loading customers:', error);
            Alert.alert('Hata', 'Müşteriler yüklenemedi.');
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadCustomers();
    };

    const filterCustomers = () => {
        let filtered = customers;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(customer =>
                customer.companyName.toLowerCase().includes(query) ||
                customer.contactPerson.toLowerCase().includes(query) ||
                customer.email.toLowerCase().includes(query)
            );
        }

        setFilteredCustomers(filtered);
    };

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setFormData({
            companyName: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
        });
        setModalVisible(true);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            companyName: customer.companyName,
            contactPerson: customer.contactPerson,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
        });
        setModalVisible(true);
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
                    onPress: async () => {
                        try {
                            await customerService.delete(customer.id);
                            Alert.alert('Başarılı', 'Müşteri silindi.');
                            loadCustomers();
                        } catch (error) {
                            console.error('Delete customer error:', error);
                            Alert.alert('Hata', 'Müşteri silinemedi.');
                        }
                    }
                }
            ]
        );
    };

    const handleSaveCustomer = async () => {
        if (!formData.companyName || !formData.contactPerson || !formData.email) {
            Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
            return;
        }

        if (!formData.email.includes('@')) {
            Alert.alert('Hata', 'Geçerli bir email adresi girin.');
            return;
        }

        try {
            if (editingCustomer) {
                // Update existing customer
                await customerService.update(editingCustomer.id, {
                    companyName: formData.companyName,
                    contactPerson: formData.contactPerson,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                });
                Alert.alert('Başarılı', 'Müşteri güncellendi.');
            } else {
                // Add new customer
                await customerService.create({
                    companyName: formData.companyName,
                    contactPerson: formData.contactPerson,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                });
                Alert.alert('Başarılı', 'Yeni müşteri eklendi.');
            }
            setModalVisible(false);
            setFormData({
                companyName: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
            });
            loadCustomers();
        } catch (error) {
            console.error('Save customer error:', error);
            Alert.alert('Hata', error.response?.data?.error || 'İşlem başarısız.');
        }
    };

    const renderCustomer = ({ item }) => (
        <View style={styles.customerCard}>
            <View style={styles.customerHeader}>
                <View style={styles.companyIcon}>
                    <Text style={styles.companyIconText}>🏢</Text>
                </View>
                <View style={styles.customerInfo}>
                    <Text style={styles.companyName}>{item.companyName}</Text>
                    <Text style={styles.contactPerson}>👤 {item.contactPerson}</Text>
                    <Text style={styles.contactEmail}>✉️ {item.email}</Text>
                    {item.phone && <Text style={styles.contactPhone}>📞 {item.phone}</Text>}
                    {item.address && <Text style={styles.contactAddress}>📍 {item.address}</Text>}
                </View>
            </View>

            <View style={styles.customerStats}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{item.activeJobs}</Text>
                    <Text style={styles.statLabel}>Aktif İş</Text>
                </View>
            </View>

            <View style={styles.customerActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditCustomer(item)}
                >
                    <Text style={styles.editButtonText}>✏️ Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCustomer(item)}
                >
                    <Text style={styles.deleteButtonText}>🗑️ Sil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyTitle}>Müşteri bulunamadı</Text>
            <Text style={styles.emptyText}>
                {searchQuery ? 'Arama kriterlerinize uygun müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#CCFF04" />
                <Text style={styles.loadingText}>Müşteriler yükleniyor...</Text>
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
                        placeholder="Müşteri ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredCustomers}
                renderItem={renderCustomer}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#CCFF04']}
                        tintColor="#CCFF04"
                    />
                }
            />

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.fab} onPress={handleAddCustomer}>
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>

            {/* Add/Edit Customer Modal */}
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
                                {editingCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
                            </Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Şirket Adı *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ABC Şirketi"
                                    value={formData.companyName}
                                    onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>İletişim Kişisi *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ahmet Yılmaz"
                                    value={formData.contactPerson}
                                    onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="info@sirket.com"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Telefon</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="+90 555 123 4567"
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Adres</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="İstanbul, Kadıköy"
                                    value={formData.address}
                                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                                    multiline
                                    numberOfLines={3}
                                />
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
                                    onPress={handleSaveCustomer}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {editingCustomer ? 'Güncelle' : 'Ekle'}
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
        color: '#CCFF04',
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
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    customerCard: {
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
    customerHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    companyIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(204, 255, 4, 0.2)', // #CCFF04 with opacity
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#CCFF04',
    },
    companyIconText: {
        fontSize: 24,
        color: '#CCFF04',
    },
    customerInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    contactPerson: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 2,
    },
    contactEmail: {
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 2,
    },
    contactPhone: {
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 2,
    },
    contactAddress: {
        fontSize: 13,
        color: '#94a3b8',
    },
    customerStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingVertical: 12,
        marginBottom: 12,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#CCFF04',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    customerActions: {
        flexDirection: 'row',
    },
    editButton: {
        flex: 1,
        backgroundColor: '#CCFF04',
        padding: 10,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red with opacity
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    deleteButtonText: {
        color: '#EF4444',
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
        backgroundColor: '#CCFF04',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#CCFF04',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#000000',
        fontWeight: '300',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
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
        marginBottom: 16,
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
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
        backgroundColor: '#CCFF04',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
});
