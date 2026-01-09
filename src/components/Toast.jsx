import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Toast Context
const ToastContext = createContext(null);

// Toast Provider Component
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Shorthand methods
    const toast = {
        info: (msg, duration) => addToast(msg, 'info', duration),
        success: (msg, duration) => addToast(msg, 'success', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Container
function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    );
}

// Individual Toast Item
function ToastItem({ toast, onRemove }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration);

        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '!';
            default: return 'i';
        }
    };

    const getTypeClass = () => {
        switch (toast.type) {
            case 'success': return 'toast-success';
            case 'error': return 'toast-error';
            case 'warning': return 'toast-warning';
            default: return 'toast-info';
        }
    };

    return (
        <div
            className={`toast-item ${getTypeClass()} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
            onClick={handleClose}
        >
            <div className="toast-icon">{getIcon()}</div>
            <div className="toast-message">{toast.message}</div>
            <div className="toast-progress">
                <div
                    className="toast-progress-bar"
                    style={{ animationDuration: `${toast.duration}ms` }}
                />
            </div>
        </div>
    );
}

export default ToastProvider;
