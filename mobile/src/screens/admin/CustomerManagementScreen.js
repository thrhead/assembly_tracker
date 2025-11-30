import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Alert, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import customerService from '../../services/customer.service';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

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
                    <MaterialIcons name="business" size={24} color={COLORS.primary} />
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
                <CustomButton
                    title="Düzenle"
                    onPress={() => handleEditCustomer(item)}
                    variant="ghost"
                    icon={<MaterialIcons name="edit" size={18} color={COLORS.primary} />}
                    style={{ flex: 1, marginRight: 8, height: 40 }}
                    textStyle={{ fontSize: 14, color: COLORS.primary }}
                />
                <CustomButton
                    title="Sil"
                    onPress={() => handleDeleteCustomer(item)}
                    variant="ghost"
                    icon={<MaterialIcons name="delete" size={18} color={COLORS.red500} />}
                    style={{ flex: 1, height: 40 }}
                    textStyle={{ fontSize: 14, color: COLORS.red500 }}
                />
            </View>
        </View>
    );

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
                renderItem={renderCustomer}
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
            <TouchableOpacity style={styles.fab} onPress={handleAddCustomer} activeOpacity={0.8}>
                <MaterialIcons name="add" size={32} color={COLORS.black} />
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

                            <CustomInput
                                label="Şirket Adı *"
                                value={formData.companyName}
                                onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                                placeholder="ABC Şirketi"
                            />

                            <CustomInput
                                label="İletişim Kişisi *"
                                value={formData.contactPerson}
                                onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                                placeholder="Ahmet Yılmaz"
                            />

                            <CustomInput
                                label="Email *"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="info@sirket.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <CustomInput
                                label="Telefon"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="+90 555 123 4567"
                                keyboardType="phone-pad"
                            />

                            <CustomInput
                                label="Adres"
                                value={formData.address}
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                placeholder="İstanbul, Kadıköy"
                                multiline
                                numberOfLines={3}
                                style={{ height: 80, textAlignVertical: 'top' }}
                            />

                            <View style={styles.modalButtons}>
                                <CustomButton
                                    title="İptal"
                                    onPress={() => setModalVisible(false)}
                                    variant="outline"
                                    style={{ flex: 1 }}
                                />
                                <CustomButton
                                    title={editingCustomer ? 'Güncelle' : 'Ekle'}
                                    onPress={handleSaveCustomer}
                                    variant="primary"
                                    style={{ flex: 1 }}
                                />
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
    customerCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    customerHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    companyIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    customerInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    contactPerson: {
        fontSize: 14,
        color: COLORS.slate400,
        marginBottom: 2,
    },
    contactEmail: {
        fontSize: 13,
        color: COLORS.slate400,
        marginBottom: 2,
    },
    contactPhone: {
        fontSize: 13,
        color: COLORS.slate400,
        marginBottom: 2,
    },
    contactAddress: {
        fontSize: 13,
        color: COLORS.slate400,
    },
    customerStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
        paddingVertical: 12,
        marginBottom: 12,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.slate400,
    },
    customerActions: {
        flexDirection: 'row',
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
        maxHeight: '85%',
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
});
