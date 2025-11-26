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

  console.log(entidades);

  const seleccionar = (id) => {
    navigate(`/entidad/${id}/locales`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Selecciona una Entidad Financiera</h2>
      <Button className="mt-3" onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        navigate("/login");
      }}>
        Log out
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entidades.map((e) => (
          <Card key={e.id}>
            <h3 className="text-lg font-semibold">{e.nombre}</h3>
            <p className="text-sm">Tasa: {e.tasa_interes * 100}% {e.tipo_tasa == "EFECTIVA" ? e.frecuencia_efectiva : e.frecuencia_nominal}</p>
            <p className="text-sm">Tipo de Tasa: {e.tipo_tasa}</p>
            <p className="text-sm">Moneda: {e.moneda}</p>
            {e.capitalizacion && <p className="text-sm">Capitalización: {e.capitalizacion}</p>}
            <p className="text-sm">Periodo de Gracia: {e.periodos_gracia_permitidos !== "SIN_GRACIA" ? "Aplica" : "No Aplica"}</p>
            {e.periodos_gracia_permitidos !== "SIN_GRACIA" && <p className="text-sm">Gracia: Hasta {e.max_meses_gracia} meses</p>}
            {e.periodos_gracia_permitidos !== "SIN_GRACIA" && <p className="text-sm">({e.periodos_gracia_permitidos})</p>}
            <p className="text-sm">Bono Techo Propio: {e.aplica_bono_techo_propio === true ? "Aplica" : "No Aplica"}</p>
            <Button className="mt-3" onClick={() => seleccionar(e.id)}>
              Elegir
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
