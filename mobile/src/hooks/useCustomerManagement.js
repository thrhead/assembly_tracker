import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import customerService from '../services/customer.service';

export const useCustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
            Alert.alert('Hata', 'Müşteriler yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers;
        const query = searchQuery.toLowerCase();
        return customers.filter(customer =>
            (customer.companyName && customer.companyName.toLowerCase().includes(query)) ||
            (customer.contactPerson && customer.contactPerson.toLowerCase().includes(query)) ||
            (customer.email && customer.email.toLowerCase().includes(query))
        );
    }, [customers, searchQuery]);

    const addCustomer = async (data) => {
        try {
            await customerService.create(data);
            Alert.alert('Başarılı', 'Yeni müşteri eklendi.');
            loadCustomers();
            return true;
        } catch (error) {
            console.error('Save customer error:', error);
            Alert.alert('Hata', error.response?.data?.error || 'İşlem başarısız.');
            return false;
        }
    };

    const updateCustomer = async (id, data) => {
        try {
            await customerService.update(id, data);
            Alert.alert('Başarılı', 'Müşteri güncellendi.');
            loadCustomers();
            return true;
        } catch (error) {
            console.error('Update customer error:', error);
            Alert.alert('Hata', error.response?.data?.error || 'İşlem başarısız.');
            return false;
        }
    };

    const deleteCustomer = async (id) => {
        try {
            await customerService.delete(id);
            Alert.alert('Başarılı', 'Müşteri silindi.');
            loadCustomers();
            return true;
        } catch (error) {
            console.error('Delete customer error:', error);
            Alert.alert('Hata', 'Müşteri silinemedi.');
            return false;
        }
    };

    return {
        customers,
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
    };
};
