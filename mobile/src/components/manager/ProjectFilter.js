import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ProjectFilter = ({ jobs, selectedJob, onSelect }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectFilter}>
            <TouchableOpacity
                style={[styles.projectChip, !selectedJob && styles.projectChipActive]}
                onPress={() => onSelect(null)}
            >
                <Text style={[styles.projectChipText, !selectedJob && styles.projectChipTextActive]}>
                    Tüm Projeler
                </Text>
                {!selectedJob && <MaterialIcons name="expand-more" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
            {jobs.slice(0, 3).map(job => (
                <TouchableOpacity
                    key={job.id}
                    style={[styles.projectChip, selectedJob?.id === job.id && styles.projectChipActive]}
                    onPress={() => onSelect(job)}
                >
                    <Text style={[styles.projectChipText, selectedJob?.id === job.id && styles.projectChipTextActive]}>
                        {job.title}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    projectFilter: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    projectChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.slate800,
        marginRight: 12,
    },
    projectChipActive: {
        backgroundColor: 'rgba(206, 254, 4, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(206, 254, 4, 0.4)',
    },
    projectChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.slate400,
        marginRight: 4,
    },
    projectChipTextActive: {
        color: COLORS.primary,
    },
});

export default ProjectFilter;
