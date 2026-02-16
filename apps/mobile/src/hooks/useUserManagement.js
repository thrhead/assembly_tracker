import { useState, useEffect, useMemo } from 'react';
import userService from '../services/user.service';
import { useAlert } from '../context/AlertContext';

export const useUserManagement = () => {
    const { showAlert } = useAlert();
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
            showAlert('Hata', 'Kullanıcılar yüklenemedi.', [], 'error');
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
            showAlert('Başarılı', 'Kullanıcı oluşturuldu.', [], 'success');
            loadUsers();
            return true;
        } catch (error) {
            console.error('Save user error:', error);
            showAlert('Hata', 'İşlem başarısız.', [], 'error');
            return false;
        }
    };

    const updateUser = async (id, data) => {
        try {
            const updateData = { ...data };
            if (!updateData.password) delete updateData.password;
            await userService.update(id, updateData);
            showAlert('Başarılı', 'Kullanıcı güncellendi.', [], 'success');
            loadUsers();
            return true;
        } catch (error) {
            console.error('Update user error:', error);
            showAlert('Hata', 'İşlem başarısız.', [], 'error');
            return false;
        }
    };

    const deleteUser = async (id) => {
        try {
            await userService.delete(id);
            showAlert('Başarılı', 'Kullanıcı silindi.', [], 'success');
            loadUsers();
            return true;
        } catch (error) {
            console.error('Delete user error:', error);
            showAlert('Hata', 'Kullanıcı silinemedi.', [], 'error');
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
