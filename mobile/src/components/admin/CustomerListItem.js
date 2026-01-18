import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '../CustomButton';
import { COLORS } from '../../constants/theme';

const CustomerListItem = ({ item, onEdit, onDelete, theme }) => {
    const colors = theme ? theme.colors : COLORS;

    return (
        <View style={[styles.customerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.customerHeader}>
                <View style={[styles.companyIcon, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
                    <MaterialIcons name="business" size={24} color={colors.primary} />
                </View>
                <View style={styles.customerInfo}>
                    <Text style={[styles.companyName, { color: colors.text }]}>{item.companyName}</Text>
                    <Text style={[styles.contactPerson, { color: colors.subText }]}>👤 {item.contactPerson}</Text>
                    <Text style={[styles.contactEmail, { color: colors.subText }]}>✉️ {item.email}</Text>
                    {item.phone && <Text style={[styles.contactPhone, { color: colors.subText }]}>📞 {item.phone}</Text>}
                    {item.address && <Text style={[styles.contactAddress, { color: colors.subText }]}>📍 {item.address}</Text>}
                </View>
            </View>

            <View style={[styles.customerStats, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{item.activeJobs}</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Aktif İş</Text>
                </View>
            </View>

            <View style={styles.customerActions}>
                <CustomButton
                    title="Düzenle"
                    onPress={() => onEdit(item)}
                    variant="ghost"
                    icon={<MaterialIcons name="edit" size={18} color={colors.primary} />}
                    style={{ flex: 1, marginRight: 8, height: 40 }}
                    textStyle={{ fontSize: 14, color: colors.primary }}
                    theme={theme}
                />
                <CustomButton
                    title="Sil"
                    onPress={() => onDelete(item)}
                    variant="ghost"
                    icon={<MaterialIcons name="delete" size={18} color={colors.error || COLORS.red500} />}
                    style={{ flex: 1, height: 40 }}
                    textStyle={{ fontSize: 14, color: colors.error || COLORS.red500 }}
                    theme={theme}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    customerCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    customerHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    companyIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
    },
    customerInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    contactPerson: {
        fontSize: 14,
        marginBottom: 2,
    },
    contactEmail: {
        fontSize: 13,
        marginBottom: 2,
    },
    contactPhone: {
        fontSize: 13,
        marginBottom: 2,
    },
    contactAddress: {
        fontSize: 13,
    },
    customerStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 12,
        marginBottom: 12,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    customerActions: {
        flexDirection: 'row',
    },
});

export default CustomerListItem;
