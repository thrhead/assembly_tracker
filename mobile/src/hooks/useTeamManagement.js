import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import teamService from '../services/team.service';
import userService from '../services/user.service';
import { useAuth } from '../context/AuthContext';

export const useTeamManagement = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);

    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [teamsData, usersData] = await Promise.all([
                teamService.getAll(),
                isAdmin ? userService.getAll() : Promise.resolve([])
            ]);

            setTeams(teamsData);
            if (isAdmin) {
                setAvailableUsers(usersData);
            }

            if (!isAdmin) {
                let targetTeam = teamsData.find(t => t.leadId === user.id);
                if (!targetTeam) {
                    targetTeam = teamsData.find(t => t.members?.some(m => m.userId === user.id));
                }
                setMembers(targetTeam ? targetTeam.members : []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Hata', 'Veriler yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const createTeam = async (data) => {
        try {
            await teamService.create(data);
            Alert.alert('Başarılı', 'Yeni ekip oluşturuldu.');
            loadData();
            return true;
        } catch (error) {
            console.error('Save team error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
            return false;
        }
    };

    const updateTeam = async (id, data) => {
        try {
            await teamService.update(id, data);
            Alert.alert('Başarılı', 'Ekip güncellendi.');
            loadData();
            return true;
        } catch (error) {
            console.error('Save team error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
            return false;
        }
    };

    const deleteTeam = async (id) => {
        try {
            setLoading(true);
            await teamService.delete(id);
            Alert.alert('Başarılı', 'Ekip silindi.');
            loadData();
            return true;
        } catch (error) {
            console.error('Delete team error:', error);
            Alert.alert('Hata', error.message || 'Ekip silinemedi.');
            setLoading(false);
            return false;
        }
    };

    return {
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
    };
};
