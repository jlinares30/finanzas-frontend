import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocales } from "../api/locales.api";
import { getProfile } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Profile from "../components/ui/Profile";
import { formatMoney } from "../utils/format";

export default function LocalList() {
  const [locales, setLocales] = useState([]);
  const [filteredLocales, setFilteredLocales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [localesRes, profileRes] = await Promise.all([
          getLocales(),
          getProfile(user.id)
        ]);

        const allLocales = localesRes.data.locales || [];
        setLocales(allLocales);

        // Filter based on income if available
        const ingresos = profileRes.data.user.Socioeconomico.ingresos_mensuales || profileRes.data.user.Socioeconomico.ingresos_mensuales || 0;
        if (ingresos > 0) {
          const maxPrice = ingresos * 50;
          const EXCHANGE_RATE = 3.5

          const filtered = allLocales.filter(l => {
            const priceInPen = l.moneda === 'USD' ? l.precio * EXCHANGE_RATE : l.precio;
            return priceInPen <= maxPrice;
          });

          setFilteredLocales(filtered);
        } else {
          setFilteredLocales(allLocales);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const seleccionarLocal = (localId) => {
    navigate(`/local/${localId}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Cargando propiedades...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Encuentra tu Hogar Ideal</h2>
          <p className="text-lg text-gray-600">Propiedades ajustadas a tu perfil financiero</p>
        </div>
        <Profile />
      </div>

      {filteredLocales.length === 0 ? (
        <Card className="text-center py-16 max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🏠</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No encontramos propiedades disponibles</h3>
          <p className="text-gray-600 mb-6">No hay locales ajustados a tu perfil de ingresos en este momento.</p>
          <Button onClick={() => navigate("/profile")}>Actualizar mi perfil</Button>
        </Card>
      ) : (
        <>
          <div className="mb-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Propiedades Recomendadas</h3>
                <p className="text-sm text-gray-600">Encontramos {filteredLocales.length} {filteredLocales.length === 1 ? 'propiedad' : 'propiedades'} perfectas para ti</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocales.map((local) => (
              <Card key={local.id} className="overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer group">
                <div className="relative">
                  {local.imagen_url ? (
                    <img
                      src={local.imagen_url}
                      alt={local.nombre}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                      <span className="text-7xl">🏠</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <p className="font-bold text-green-600">{formatMoney(local.precio, local.moneda)}</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">{local.nombre}</h3>
                  <div className="flex items-start gap-2 text-gray-600 mb-4">
                    <span className="text-lg">📍</span>
                    <p className="text-sm">{local.direccion}</p>
                  </div>

                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-lg">🏢</span>
                      <span className="text-sm font-medium text-blue-700">{local.tipo}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    onClick={() => seleccionarLocal(local.id)}
                  >
                    Ver Detalles y Simular
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}