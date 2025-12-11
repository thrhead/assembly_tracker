import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import userService from '../services/user.service';

export const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Hata', 'Kullanıcılar yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredUsers = useMemo(() => {
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
        return filtered;
    }, [users, activeTab, searchQuery]);

    const addUser = async (data) => {
        try {
            await userService.create(data);
            Alert.alert('Başarılı', 'Kullanıcı oluşturuldu.');
            loadUsers();
            return true;
        } catch (error) {
            console.error('Save user error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
            return false;
        }
    };

    const updateUser = async (id, data) => {
        try {
            const updateData = { ...data };
            if (!updateData.password) delete updateData.password;
            await userService.update(id, updateData);
            Alert.alert('Başarılı', 'Kullanıcı güncellendi.');
            loadUsers();
            return true;
        } catch (error) {
            console.error('Update user error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
            return false;
        }
    };

    const deleteUser = async (id) => {
        try {
            await userService.delete(id);
            Alert.alert('Başarılı', 'Kullanıcı silindi.');
            loadUsers();
            return true;
        } catch (error) {
            console.error('Delete user error:', error);
            Alert.alert('Hata', 'Kullanıcı silinemedi.');
            return false;
        }
    };

    return {
        users,
        filteredUsers,
        loading,
        refreshing,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        loadUsers,
        addUser,
        updateUser,
        deleteUser,
        setRefreshing
    };
};
