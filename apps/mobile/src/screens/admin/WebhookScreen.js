import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useWebhooks } from '../../hooks/useWebhooks';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../../components/ui/GlassCard';

export default function WebhookScreen() {
    const { theme, isDark } = useTheme();
    const { webhooks, logs, loading, refreshing, onRefresh, loadWebhooks, loadLogs, toggleWebhook } = useWebhooks();
    const [activeTab, setActiveTab] = useState('endpoints');

    useEffect(() => {
        loadWebhooks();
        loadLogs();
    }, []);

    const renderEndpointItem = ({ item }) => (
        <GlassCard theme={theme} style={styles.webhookCard}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.webhookUrl, { color: theme.colors.text }]} numberOfLines={1}>{item.url}</Text>
                    <Text style={[styles.webhookEvent, { color: theme.colors.primary }]}>{item.event}</Text>
                </View>
                <Switch
                    value={item.isActive}
                    onValueChange={(val) => toggleWebhook(item.id, val)}
                    trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                    thumbColor={item.isActive ? theme.colors.primary : '#f4f3f4'}
                />
            </View>
            <View style={styles.cardFooter}>
                <Text style={{ color: theme.colors.subText, fontSize: 12 }}>Eklendi: {new Date(item.createdAt).toLocaleDateString()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#22c55e20' : '#ef444420' }]}>
                    <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#22c55e' : '#ef4444' }]} />
                    <Text style={{ color: item.isActive ? '#22c55e' : '#ef4444', fontSize: 10, fontWeight: 'bold' }}>
                        {item.isActive ? 'AKTİF' : 'PASİF'}
                    </Text>
                </View>
            </View>
        </GlassCard>
    );

    const renderLogItem = ({ item }) => (
        <View style={[styles.logItem, { borderBottomColor: theme.colors.cardBorder }]}>
            <View style={[styles.methodBadge, { backgroundColor: item.statusCode >= 200 && item.statusCode < 300 ? '#22c55e20' : '#ef444420' }]}>
                <Text style={{ color: item.statusCode >= 200 && item.statusCode < 300 ? '#22c55e' : '#ef4444', fontWeight: 'bold', fontSize: 12 }}>
                    {item.statusCode || 'ERR'}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.logEvent, { color: theme.colors.text }]}>{item.event}</Text>
                <Text style={[styles.logTime, { color: theme.colors.subText }]}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            {item.error && (
                <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'endpoints' && { borderBottomColor: theme.colors.primary }]}
                    onPress={() => setActiveTab('endpoints')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'endpoints' ? theme.colors.primary : theme.colors.subText }]}>Endpoints</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'logs' && { borderBottomColor: theme.colors.primary }]}
                    onPress={() => setActiveTab('logs')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'logs' ? theme.colors.primary : theme.colors.subText }]}>Delivery Logs</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeTab === 'endpoints' ? webhooks : logs}
                renderItem={activeTab === 'endpoints' ? renderEndpointItem : renderLogItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="security" size={64} color={theme.colors.subText} />
                        <Text style={{ color: theme.colors.subText }}>Veri bulunamadı.</Text>
                    </View>
                }
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
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    listContent: {
        padding: 16,
    },
    webhookCard: {
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    webhookUrl: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    webhookEvent: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    methodBadge: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logEvent: {
        fontSize: 14,
        fontWeight: '600',
    },
    logTime: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        gap: 16,
    }
});
