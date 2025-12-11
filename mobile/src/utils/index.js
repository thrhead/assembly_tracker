export const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
