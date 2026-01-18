import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ProjectFilter = ({ jobs, selectedJob, onSelect, theme }) => {
    const colors = theme ? theme.colors : COLORS;
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.customer?.companyName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (job) => {
        onSelect(job);
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.dropdownTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setVisible(true)}
            >
                <View style={styles.triggerContent}>
                    <Text style={[
                        styles.triggerLabel,
                        { color: selectedJob ? colors.primary : colors.text }
                    ]}>
                        {selectedJob ? selectedJob.title : 'Tüm Projeler'}
                    </Text>
                    {selectedJob && (
                        <Text style={[styles.triggerSubLabel, { color: colors.subText }]}>
                            {selectedJob.customer?.companyName || 'Müşteri'}
                        </Text>
                    )}
                </View>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.subText} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Proje Seç</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <MaterialIcons name="close" size={24} color={colors.subText} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                            <MaterialIcons name="search" size={20} color={colors.subText} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Proje ara..."
                                placeholderTextColor={colors.subText}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        <FlatList
                            data={[{ id: 'all', title: 'Tüm Projeler' }, ...filteredJobs]}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.item,
                                        { borderBottomColor: colors.border },
                                        selectedJob?.id === item.id && { backgroundColor: `${colors.primary}10` }
                                    ]}
                                    onPress={() => handleSelect(item.id === 'all' ? null : item)}
                                >
                                    <View>
                                        <Text style={[
                                            styles.itemTitle,
                                            { color: item.id === 'all' || selectedJob?.id === item.id ? colors.primary : colors.text }
                                        ]}>
                                            {item.title}
                                        </Text>
                                        {item.customer && (
                                            <Text style={[styles.itemSubtitle, { color: colors.subText }]}>
                                                {item.customer.companyName}
                                            </Text>
                                        )}
                                    </View>
                                    {selectedJob?.id === item.id && (
                                        <MaterialIcons name="check" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    triggerContent: {
        flex: 1,
    },
    triggerLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    triggerSubLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 16,
        maxHeight: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        margin: 16,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
});

export default ProjectFilter;
