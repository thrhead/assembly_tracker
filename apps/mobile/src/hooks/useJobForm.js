import { useState } from 'react';
import { Alert } from 'react-native';
import jobService from '../services/job.service';
import { CHECKLIST_TEMPLATES } from '../constants/templates';

export const useJobForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        customerId: '',
        teamId: '',
        priority: 'MEDIUM',
        location: '',
        scheduledDate: new Date(),
        scheduledEndDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // +2 hours
    });

    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);

    // Checklist Logic
    const addStep = () => {
        setSteps([...steps, { title: '', description: '', subSteps: [] }]);
    };

    const removeStep = (index) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        setSteps(newSteps);
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const addSubStep = (stepIndex) => {
        const newSteps = [...steps];
        if (!newSteps[stepIndex].subSteps) newSteps[stepIndex].subSteps = [];
        newSteps[stepIndex].subSteps.push({ title: '' });
        setSteps(newSteps);
    };

    const updateSubStep = (stepIndex, subStepIndex, value) => {
        const newSteps = [...steps];
        newSteps[stepIndex].subSteps[subStepIndex].title = value;
        setSteps(newSteps);
    };

    const removeSubStep = (stepIndex, subStepIndex) => {
        const newSteps = [...steps];
        newSteps[stepIndex].subSteps.splice(subStepIndex, 1);
        setSteps(newSteps);
    };

    const moveStep = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === steps.length - 1) return;

        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    };

    const loadTemplate = (key) => {
        const template = CHECKLIST_TEMPLATES[key];
        if (template) {
            setSteps(JSON.parse(JSON.stringify(template.steps)));
        }
    };

    const submitJob = async (onSuccess) => {
        if (!formData.title || !formData.customerId) {
            Alert.alert('Hata', 'Lütfen başlık ve müşteri seçiniz');
            return;
        }

        setLoading(true);
        try {
            const validSteps = steps.filter(step => step.title.trim() !== '')
                .map(step => ({
                    ...step,
                    subSteps: step.subSteps?.filter(sub => sub.title.trim() !== '')
                }));

            const jobData = {
                ...formData,
                teamId: formData.teamId || undefined,
                location: formData.location || undefined,
                description: formData.description || undefined,
                scheduledDate: formData.scheduledDate.toISOString(),
                scheduledEndDate: formData.scheduledEndDate.toISOString(),
                steps: validSteps.length > 0 ? validSteps : null
            };

            await jobService.create(jobData);
            Alert.alert('Başarılı', 'İş başarıyla oluşturuldu', [
                { text: 'Tamam', onPress: onSuccess }
            ]);
        } catch (error) {
            console.error('Create job error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'İş oluşturulurken bir hata oluştu';
            Alert.alert('Hata', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        steps,
        loading,
        addStep,
        removeStep,
        updateStep,
        addSubStep,
        removeSubStep,
        updateSubStep,
        moveStep,
        loadTemplate,
        submitJob
    };
};
