import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocales } from "../api/locales.api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Profile from "../components/ui/Profile";

export default function LocalList() {
  const [locales, setLocales] = useState([]);
  const { entidadId } = useParams();
  const navigate = useNavigate();

  console.log(entidadId);

  useEffect(() => {
    getLocales().then((r) => setLocales(r.data.locales || []));
  }, []);

  const seleccionarLocal = (localId) => {
    navigate(`/entidad/${entidadId}/local/${localId}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Selecciona un Local / Vivienda</h2>
        <Profile />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {locales.map((local) => (
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
              className="mt-4 w-full"
              onClick={() => seleccionarLocal(local.id)}
            >
              Seleccionar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
