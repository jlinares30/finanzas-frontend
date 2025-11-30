import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const ConfirmationContext = createContext();

export function useConfirmation() {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
}

export function ConfirmationProvider({ children }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        showCancel: true,
    });

    const resolver = useRef(null);

    const confirm = useCallback(({
        title = 'Confirmación',
        message,
        type = 'warning',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar'
    }) => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            confirmText,
            cancelText,
            showCancel: true,
        });

        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const alert = useCallback((message, title = 'Alerta', type = 'info') => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'Aceptar',
            showCancel: false,
        });

        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const handleConfirm = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolver.current) {
            resolver.current(true);
            resolver.current = null;
        }
    };

    const handleClose = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolver.current) {
            resolver.current(false);
            resolver.current = null;
        }
    };

    return (
        <ConfirmationContext.Provider value={{ confirm, alert }}>
            {children}
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                showCancel={modalState.showCancel}
            />
        </ConfirmationContext.Provider>
    );
}
