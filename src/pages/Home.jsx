import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Card from "../components/ui/Card";
import Profile from "../components/ui/Profile";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const quickActions = [
    {
      title: "Nueva Simulación",
      description: "Explora locales y simula tu crédito hipotecario.",
      icon: "🏠",
      path: "/locales",
      color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "Historial",
      description: "Revisa tus simulaciones y planes de pago guardados.",
      icon: "📜",
      path: "/history",
      color: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
    },
    {
      title: "Mi Perfil",
      description: "Actualiza tus datos personales y socioeconómicos.",
      icon: "👤",
      path: "/profile",
      color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hola, {user?.name || "Usuario"} 👋</h1>
          <p className="text-gray-600">Bienvenido a tu panel financiero.</p>
        </div>
        <Profile />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <div
            key={action.title}
            onClick={() => navigate(action.path)}
            className={`cursor-pointer p-6 rounded-xl border transition-all shadow-sm hover:shadow-md ${action.color}`}
          >
            <div className="text-4xl mb-4">{action.icon}</div>
            <h3 className="text-lg font-bold mb-2">{action.title}</h3>
            <p className="text-sm opacity-90">{action.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>
        <Card className="bg-white">
          <div className="p-4 text-center text-gray-500">
            <p>Aquí verás un resumen de tus actividades recientes pronto.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
