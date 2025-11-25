import { useEffect, useState } from "react";
import { getEntidades } from "../api/entidadFinanciera.api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [entidades, setEntidades] = useState([]);

  useEffect(() => {
    getEntidades().then(r => setEntidades(r.data));
  }, []);

  const seleccionar = (id) => {
    navigate(`/simulador?entidad=${id}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Selecciona una Entidad Financiera</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entidades.map((e) => (
          <Card key={e.id}>
            <h3 className="text-lg font-semibold">{e.nombre}</h3>
            <p className="text-sm">Tasa: {e.tasa_interes}</p>

            <Button className="mt-3" onClick={() => seleccionar(e.id)}>
              Elegir
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
