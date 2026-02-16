import { useState } from "react";
import { Alert } from "react-native";
import jobService from "../services/job.service";
import { CHECKLIST_TEMPLATES } from "../constants/templates";

export const useJobForm = (job = null) => {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    projectNo: job?.projectNo || "",
    description: job?.description || "",
    customerId: job?.customerId || "",
    teamId: job?.assignments?.[0]?.teamId || "",
    priority: job?.priority || "MEDIUM",
    status: job?.status || "PENDING",
    acceptanceStatus: job?.acceptanceStatus || "PENDING",
    location: job?.location || "",
    scheduledDate: job?.scheduledDate
      ? new Date(job.scheduledDate)
      : new Date(),
    scheduledEndDate: job?.scheduledEndDate
      ? new Date(job.scheduledEndDate)
      : new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    startedAt: job?.startedAt ? new Date(job.startedAt) : null,
    completedDate: job?.completedDate ? new Date(job.completedDate) : null,
    budget: job?.budget ? String(job.budget) : "",
    estimatedDuration: job?.estimatedDuration
      ? String(job.estimatedDuration)
      : "",
  });

  const [steps, setSteps] = useState(
    job?.steps ? JSON.parse(JSON.stringify(job.steps)) : [],
  );
  const [loading, setLoading] = useState(false);

  // ... existing logic (addStep, removeStep, etc.) ...

  // Copy existing methods from current file
  const addStep = () => {
    setSteps([...steps, { title: "", description: "", subSteps: [] }]);
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
    newSteps[stepIndex].subSteps.push({ title: "" });
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
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];
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
      Alert.alert("Hata", "Lütfen başlık ve müşteri seçiniz");
      return;
    }

    setLoading(true);
    try {
      const validSteps = steps
        .filter((step) => step.title.trim() !== "")
        .map((step) => ({
          id: step.id, // Preserve ID for updates
          title: step.title,
          description: step.description,
          subSteps: step.subSteps
            ?.filter((sub) => sub.title.trim() !== "")
            .map((sub) => ({ id: sub.id, title: sub.title })), // Preserve ID for substeps
        }));

      const jobData = {
        ...formData,
        teamId: formData.teamId || "none",
        location: formData.location || undefined,
        description: formData.description || undefined,
        scheduledDate: formData.scheduledDate.toISOString(),
        scheduledEndDate: formData.scheduledEndDate.toISOString(),
        startedAt: formData.startedAt?.toISOString() || null,
        completedDate: formData.completedDate?.toISOString() || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        estimatedDuration: formData.estimatedDuration
          ? parseInt(formData.estimatedDuration, 10)
          : null,
        steps: validSteps.length > 0 ? validSteps : null,
      };

      if (job) {
        await jobService.update(job.id, jobData);
        Alert.alert("Başarılı", "İş başarıyla güncellendi", [
          { text: "Tamam", onPress: onSuccess },
        ]);
      } else {
        await jobService.create(jobData);
        Alert.alert("Başarılı", "İş başarıyla oluşturuldu", [
          { text: "Tamam", onPress: onSuccess },
        ]);
      }
    } catch (error) {
      console.error("Submit job error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Bir hata oluştu";
      Alert.alert("Hata", errorMessage);
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
    submitJob,
  };
};
