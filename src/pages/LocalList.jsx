import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocales } from "../api/locales.api";
import { getProfile } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Profile from "../components/ui/Profile";

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
        const ingresos = profileRes.data.ingresos_mensuales || profileRes.data.cliente?.ingresos_mensuales || 0;

        if (ingresos > 0) {
          const maxPrice = ingresos * 50;
          const filtered = allLocales.filter(l => l.precio <= maxPrice);
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

  if (loading) return <div className="p-6">Cargando locales...</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Selecciona un Local / Vivienda</h2>
        <Profile />
      </div>

      {filteredLocales.length === 0 ? (
        <p>No se encontraron locales ajustados a tu perfil de ingresos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLocales.map((local) => (
            <Card key={local.id} className="shadow-md">
              {local.imagen_url && (
                <img
                  src={local.imagen_url}
                  alt={local.nombre}
                  className="w-full h-40 object-cover rounded"
                />
              )}

              <h3 className="text-lg font-semibold mt-3">{local.nombre}</h3>
              <p className="text-sm text-gray-600">{local.direccion}</p>

              <div className="mt-2">
                <p className="text-sm">
                  <strong>Precio:</strong> {local.moneda} {local.precio}
                </p>
                <p className="text-sm">
                  <strong>Tipo:</strong> {local.tipo}
                </p>
              </div>

              <Button
                className="mt-4 w-full bg-green-600 hover:bg-green-700"
                onClick={() => seleccionarLocal(local.id)}
              >
                Seleccionar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
