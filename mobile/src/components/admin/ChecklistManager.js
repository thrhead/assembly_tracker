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
    onOpenTemplateModal
}) => {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Kontrol Listesi</Text>
                <View style={styles.sectionActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onOpenTemplateModal}
                    >
                        <MaterialIcons name="file-copy" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onAddStep}
                    >
                        <MaterialIcons name="add-circle" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {steps.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Adım eklenmedi</Text>
                </View>
            ) : (
                steps.map((step, index) => (
                    <View key={index} style={styles.stepCard}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepIndex}>{index + 1}.</Text>
                            <View style={{ flex: 1 }}>
                                <CustomInput
                                    value={step.title}
                                    onChangeText={(text) => onUpdateStep(index, 'title', text)}
                                    placeholder="Adım başlığı"
                                    style={{ marginBottom: 8 }}
                                />
                                <CustomInput
                                    value={step.description}
                                    onChangeText={(text) => onUpdateStep(index, 'description', text)}
                                    placeholder="Açıklama (Opsiyonel)"
                                    multiline
                                />
                            </View>
                            <View style={styles.stepActions}>
                                <TouchableOpacity
                                    onPress={() => onMoveStep(index, 'up')}
                                    disabled={index === 0}
                                    style={[styles.iconButton, index === 0 && styles.disabledIcon]}
                                >
                                    <MaterialIcons name="keyboard-arrow-up" size={20} color={COLORS.slate400} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onMoveStep(index, 'down')}
                                    disabled={index === steps.length - 1}
                                    style={[styles.iconButton, index === steps.length - 1 && styles.disabledIcon]}
                                >
                                    <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.slate400} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onRemoveStep(index)}
                                    style={styles.iconButton}
                                >
                                    <MaterialIcons name="close" size={20} color={COLORS.red500} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Substeps */}
                        <View style={styles.subStepsContainer}>
                            {step.subSteps?.map((subStep, subIndex) => (
                                <View key={subIndex} style={styles.subStepRow}>
                                    <MaterialIcons name="subdirectory-arrow-right" size={16} color={COLORS.slate500} />
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <CustomInput
                                            value={subStep.title}
                                            onChangeText={(text) => onUpdateSubStep(index, subIndex, text)}
                                            placeholder="Alt görev"
                                            style={{ height: 40 }}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => onRemoveSubStep(index, subIndex)}
                                        style={styles.removeSubButton}
                                    >
                                        <MaterialIcons name="close" size={16} color={COLORS.red500} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.addSubStepButton}
                                onPress={() => onAddSubStep(index)}
                            >
                                <MaterialIcons name="add" size={16} color={COLORS.blue500} />
                                <Text style={styles.addSubStepText}>Alt Görev Ekle</Text>
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
        color: COLORS.white,
    },
    sectionActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        backgroundColor: COLORS.cardDark,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    emptyState: {
        padding: 20,
        backgroundColor: COLORS.cardDark,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderStyle: 'dashed',
    },
    emptyText: {
        color: COLORS.slate500,
    },
    stepCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepIndex: {
        color: COLORS.slate400,
        marginRight: 8,
        marginTop: 12,
        fontWeight: 'bold',
    },
    stepActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 4,
        marginLeft: 4,
    },
    disabledIcon: {
        opacity: 0.3,
    },
    subStepsContainer: {
        marginTop: 12,
        paddingLeft: 24,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.slate800,
    },
    subStepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    removeSubButton: {
        padding: 4,
    },
    addSubStepButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginTop: 4,
    },
    addSubStepText: {
        color: COLORS.blue500,
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
});

export default ChecklistManager;
