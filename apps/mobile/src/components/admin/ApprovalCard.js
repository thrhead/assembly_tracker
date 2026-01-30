import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
// import { COLORS } from '../../constants/theme'; // Removed

const ApprovalCard = ({ item, onApprove, onReject, theme: propTheme }) => {
    const { theme: contextTheme } = useTheme();
    const theme = propTheme || contextTheme;
    const [isExpanded, setIsExpanded] = React.useState(false);

    const cardBg = theme.colors.card;
    const border = theme.colors.cardBorder;
    const textMain = theme.colors.text;
    const textSub = theme.colors.subText;
    const primary = theme.colors.primary;
    const error = theme.colors.error;

    return (
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.cardHeader}
            >
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.dateText, { color: textSub }]}>{item.date}</Text>
                    <MaterialIcons
                        name={isExpanded ? "expand-less" : "expand-more"}
                        size={20}
                        color={textSub}
                    />
                </View>
            </TouchableOpacity>

            <Text style={[styles.title, { color: textMain }]}>{item.title}</Text>
            <Text style={[styles.requester, { color: textSub }]}>{item.requester}</Text>

            {isExpanded && (
                <View style={[styles.details, { borderTopColor: border }]}>
                    {item.type === 'COST' ? (
                        <>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: textSub }]}>Kategori:</Text>
                                <Text style={[styles.detailValue, { color: textMain }]}>{item.raw?.category}</Text>
                            </View>
                            {item.raw?.notes && (
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: textSub }]}>Notlar:</Text>
                                    <View style={[styles.noteContainer, { backgroundColor: theme.colors.background + '80' }]}>
                                        <Text style={[styles.noteText, { color: textMain }]}>{item.raw?.notes}</Text>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: textSub }]}>Müşteri:</Text>
                                <Text style={[styles.detailValue, { color: textMain }]}>{item.raw?.customer?.company || 'Bilinmiyor'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: textSub }]}>Lokasyon:</Text>
                                <Text style={[styles.detailValue, { color: textMain }]}>{item.raw?.customer?.address || 'Bilinmiyor'}</Text>
                            </View>
                        </>
                    )}
                </View>
            )}

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
    details: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 12,
        flex: 0.3,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: '600',
        flex: 0.7,
        textAlign: 'right',
    },
    noteContainer: {
        marginTop: 4,
        padding: 8,
        borderRadius: 8,
        flex: 0.7,
    },
    noteText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default ApprovalCard;
