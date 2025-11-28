import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center border p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer"
            >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-blue-700">
                    {user.name?.charAt(0).toUpperCase()}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                    <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                    >
                        <p className="text-sm">Home</p>
                    </Link>
                    <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                    >
                        <p className="text-sm">Perfil</p>
                    </Link>
                    <Link
                        to="/history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                    >
                        <p className="text-sm">Historial de Planes</p>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <p className="text-sm">Cerrar Sesión</p>
                    </button>
                </div>
            )}
        </div>
    );
}