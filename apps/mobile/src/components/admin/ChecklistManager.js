import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomInput from '../CustomInput';
import { COLORS } from '../../constants/theme';

const ChecklistManager = ({
    steps,
    onAddStep,
    onRemoveStep,
    onUpdateStep,
    onMoveStep,
    onAddSubStep,
    onRemoveSubStep,
    onUpdateSubStep,
    onOpenTemplateModal,
    theme
}) => {
    const colors = theme ? theme.colors : COLORS;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Kontrol Listesi</Text>
                <View style={styles.sectionActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={onOpenTemplateModal}
                    >
                        <MaterialIcons name="file-copy" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={onAddStep}
                    >
                        <MaterialIcons name="add-circle" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {steps.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.emptyText, { color: colors.subText }]}>Adım eklenmedi</Text>
                </View>
            ) : (
                steps.map((step, index) => (
                    <View key={step.id || step.tempId || index} style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.stepHeader}>
                            <Text style={[styles.stepIndex, { color: colors.subText }]}>{index + 1}.</Text>
                            <View style={{ flex: 1 }}>
                                <CustomInput
                                    value={step.title}
                                    onChangeText={(text) => onUpdateStep(index, 'title', text)}
                                    placeholder="Adım başlığı"
                                    style={{ marginBottom: 8 }}
                                    theme={theme}
                                />
                                <CustomInput
                                    value={step.description}
                                    onChangeText={(text) => onUpdateStep(index, 'description', text)}
                                    placeholder="Açıklama (Opsiyonel)"
                                    multiline
                                    theme={theme}
                                />
                            </View>
                            <View style={styles.stepActions}>
                                <TouchableOpacity
                                    onPress={() => onMoveStep(index, 'up')}
                                    disabled={index === 0}
                                    style={[styles.iconButton, index === 0 && styles.disabledIcon]}
                                >
                                    <MaterialIcons name="keyboard-arrow-up" size={20} color={colors.subText || COLORS.slate400} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onMoveStep(index, 'down')}
                                    disabled={index === steps.length - 1}
                                    style={[styles.iconButton, index === steps.length - 1 && styles.disabledIcon]}
                                >
                                    <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.subText || COLORS.slate400} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onRemoveStep(index)}
                                    style={styles.iconButton}
                                >
                                    <MaterialIcons name="close" size={20} color={colors.error || COLORS.red500} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Substeps */}
                        <View style={[styles.subStepsContainer, { borderLeftColor: colors.border }]}>
                            {step.subSteps?.map((subStep, subIndex) => (
                                <View key={subStep.id || subStep.tempId || subIndex} style={styles.subStepRow}>
                                    <MaterialIcons name="subdirectory-arrow-right" size={16} color={colors.subText || COLORS.slate500} />
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <CustomInput
                                            value={subStep.title}
                                            onChangeText={(text) => onUpdateSubStep(index, subIndex, text)}
                                            placeholder="Alt görev"
                                            style={{ height: 40 }}
                                            theme={theme}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => onRemoveSubStep(index, subIndex)}
                                        style={styles.removeSubButton}
                                    >
                                        <MaterialIcons name="close" size={16} color={colors.error || COLORS.red500} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.addSubStepButton}
                                onPress={() => onAddSubStep(index)}
                            >
                                <MaterialIcons name="add" size={16} color={colors.primary || COLORS.blue500} />
                                <Text style={[styles.addSubStepText, { color: colors.primary || COLORS.blue500 }]}>Alt Görev Ekle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    emptyState: {
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyText: {

    },
    stepCard: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepIndex: {
        marginRight: 8,
        marginTop: 12,
        fontWeight: 'bold',
    },
    stepActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 12,
        marginLeft: 4,
    },
    disabledIcon: {
        opacity: 0.3,
    },
    subStepsContainer: {
        marginTop: 12,
        paddingLeft: 24,
        borderLeftWidth: 1,
    },
    subStepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    removeSubButton: {
        padding: 14,
    },
    addSubStepButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginTop: 4,
    },
    addSubStepText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
});

export default ChecklistManager;
