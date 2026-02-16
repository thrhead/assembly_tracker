import { useState, useCallback, useMemo } from 'react';
import costService from '../services/cost.service';
import jobService from '../services/job.service';
import { useAlert } from '../context/AlertContext';

export const useWorkerExpenses = () => {
    const { showAlert } = useAlert();
    const [projects, setProjects] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [myJobs, myCosts] = await Promise.all([
                jobService.getMyJobs(),
                costService.getMyCosts()
            ]);

            setProjects(myJobs || []);
            setExpenses(myCosts || []);

            // Set default project if available and not already set
            if (myJobs && myJobs.length > 0 && !selectedProject) {
                setSelectedProject(myJobs[0]);
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
            showAlert('Hata', 'Masraflar yüklenirken bir hata oluştu.', [], 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedProject]);

    const createExpense = useCallback(async (formData, receiptImage) => {
        if (!formData.title || !formData.amount) {
            showAlert('Hata', 'Lütfen başlık ve tutar giriniz.', [], 'error');
            return false;
        }

        if (!formData.jobId) {
            showAlert('Hata', 'Lütfen bir proje seçiniz. Eğer projeniz yoksa masraf ekleyemezsiniz.', [], 'error');
            return false;
        }

        try {
            const finalDescription = formData.description
                ? `${formData.title} - ${formData.description}`
                : formData.title;

            const data = new FormData();
            data.append('jobId', formData.jobId);
            data.append('amount', parseFloat(formData.amount).toString());
            data.append('currency', 'TRY');
            data.append('category', formData.category);
            data.append('description', finalDescription);
            data.append('date', formData.date.toISOString());

            if (receiptImage) {
                const filename = receiptImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                data.append('receipt', {
                    uri: receiptImage,
                    name: filename,
                    type
                });
            }

            await costService.create(data);
            showAlert('Başarılı', 'Masraf başarıyla eklendi.', [], 'success');
            loadData(); // Reload data
            return true;
        } catch (error) {
            console.error('Create expense error:', error);
            showAlert('Hata', 'Masraf eklenirken bir hata oluştu.', [], 'error');
            return false;
        }
    }, [loadData]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const matchesProject = selectedProject ? expense.jobId === selectedProject.id : true;
            const matchesCategory = selectedCategory === 'Tümü' ? true : expense.category === selectedCategory;
            const matchesSearch = searchQuery
                ? (expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    expense.category?.toLowerCase().includes(searchQuery.toLowerCase()))
                : true;
            return matchesProject && matchesCategory && matchesSearch;
        });
    }, [expenses, selectedProject, selectedCategory, searchQuery]);

    const groupedExpenses = useMemo(() => {
        const groups = {
            'Bugün': [],
            'Dün': [],
            'Geçen Hafta': [],
            'Geçen Ay': [],
            'Daha Eski': []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        filteredExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const expenseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            if (expenseDate.getTime() === today.getTime()) {
                groups['Bugün'].push(expense);
            } else if (expenseDate.getTime() === yesterday.getTime()) {
                groups['Dün'].push(expense);
            } else if (expenseDate > lastWeek) {
                groups['Geçen Hafta'].push(expense);
            } else if (expenseDate > lastMonth) {
                groups['Geçen Ay'].push(expense);
            } else {
                groups['Daha Eski'].push(expense);
            }
        });

        return groups;
    }, [filteredExpenses]);

    return {
        // State
        projects,
        expenses,
        loading,
        selectedProject,
        selectedCategory,
        searchQuery,
        filteredExpenses,
        groupedExpenses,

        // Actions
        setSelectedProject,
        setSelectedCategory,
        setSearchQuery,
        loadData,
        createExpense
    };
};
