import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
// import { COLORS } from '../../constants/theme'; // Removed

const ApprovalCard = ({ item, onApprove, onReject, theme: propTheme }) => {
    // Ideally use context if prop not passed, or rely on prop content.
    // Since we passed theme prop from ApprovalsScreen, we can use it, or fallback to hook.
    const { theme: contextTheme } = useTheme();
    const theme = propTheme || contextTheme;

    const cardBg = theme.colors.card;
    const border = theme.colors.border;
    const textMain = theme.colors.text;
    const textSub = theme.colors.subText;
    const primary = theme.colors.primary;
    const error = theme.colors.error;

    return (
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'JOB' ? primary + '15' : 'rgba(255, 165, 0, 0.1)' }]}>
                    <MaterialIcons
                        name={item.type === 'JOB' ? 'work' : 'receipt'}
                        size={16}
                        color={item.type === 'JOB' ? primary : '#FFA500'}
                    />
                    <Text style={[styles.typeText, { color: item.type === 'JOB' ? primary : '#FFA500' }]}>
                        {item.type === 'JOB' ? 'İŞ ONAYI' : 'MASRAF ONAYI'}
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: textSub }]}>{item.date}</Text>
            </View>

            <Text style={[styles.title, { color: textMain }]}>{item.title}</Text>
            <Text style={[styles.requester, { color: textSub }]}>Talep Eden: {item.requester}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton, { borderColor: error + '4D', backgroundColor: error + '15' }]}
                    onPress={() => onReject(item)}
                >
                    <MaterialIcons name="close" size={20} color={error} />
                    <Text style={[styles.rejectText, { color: error }]}>Reddet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton, { backgroundColor: primary }]}
                    onPress={() => onApprove(item)}
                >
                    <MaterialIcons name="check" size={20} color={theme.colors.textInverse} />
                    <Text style={[styles.approveText, { color: theme.colors.textInverse }]}>Onayla</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    requester: {
        fontSize: 14,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    rejectButton: {
        borderWidth: 1,
    },
    approveButton: {
    },
    rejectText: {
        fontWeight: '600',
    },
    approveText: {
        fontWeight: 'bold',
    },
});

export default ApprovalCard;
