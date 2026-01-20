// Simple Event Emitter for Toast Notifications
const listeners = new Set();

export const ToastService = {
    show: (title, message, type = 'info') => {
        listeners.forEach(listener => listener({ title, message, type }));
    },

    subscribe: (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
};
