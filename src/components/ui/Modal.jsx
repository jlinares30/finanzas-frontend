import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
                <div className="p-4 border-t flex justify-end">
                    <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
