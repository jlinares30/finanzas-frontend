import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getAllPlanPagosByUserId } from "../api/planPago.api";
import Card from "../components/ui/Card";
import Profile from "../components/ui/Profile";
import Button from "../components/ui/Button";
import { formatDate, formatMoney } from "../utils/format";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentPlans, setRecentPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getAllPlanPagosByUserId(user.id)
        .then((res) => {
          const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentPlans(sorted.slice(0, 3));
        })
        .catch((err) => console.error("Error fetching recent plans:", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Actividad Reciente</h2>
          <Button variant="outline" onClick={() => navigate("/history")} className="text-sm">
            Ver todo
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-500">Cargando actividad...</p>
        ) : recentPlans.length === 0 ? (
          <Card className="bg-white text-center py-8">
            <p className="text-gray-500 mb-4">Aún no tienes simulaciones recientes.</p>
            <Button onClick={() => navigate("/locales")}>Crear mi primera simulación</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 truncate">{plan.Local?.nombre}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formatDate(plan.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-blue-600 font-medium mb-1">{plan.EntidadFinanciera?.nombre}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Cuota Mensual:</span>
                  <span className="font-bold text-gray-800">
                    {formatMoney(plan.cuota_fija, plan.moneda)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
