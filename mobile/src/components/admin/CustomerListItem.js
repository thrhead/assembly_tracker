import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '../CustomButton';
import { COLORS } from '../../constants/theme';

const CustomerListItem = ({ item, onEdit, onDelete }) => {
    return (
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
                    onPress={() => onEdit(item)}
                    variant="ghost"
                    icon={<MaterialIcons name="edit" size={18} color={COLORS.primary} />}
                    style={{ flex: 1, marginRight: 8, height: 40 }}
                    textStyle={{ fontSize: 14, color: COLORS.primary }}
                />
                <CustomButton
                    title="Sil"
                    onPress={() => onDelete(item)}
                    variant="ghost"
                    icon={<MaterialIcons name="delete" size={18} color={COLORS.red500} />}
                    style={{ flex: 1, height: 40 }}
                    textStyle={{ fontSize: 14, color: COLORS.red500 }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default CustomerListItem;
