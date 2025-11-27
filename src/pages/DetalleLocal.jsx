import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getLocalById } from "../api/locales.api";
import { useSimulationStore } from "../store/useSimulationStore";

export default function DetalleLocal() {
  const { localId, entidadId } = useParams();
  const navigate = useNavigate();
  const setSimulationData = useSimulationStore((state) => state.setSimulationData);

  const [local, setLocal] = useState(null);
  const [costoInicial, setCostoInicial] = useState(null);
  const [costoPeriodico, setCostoPeriodico] = useState(null);


  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const { data } = await getLocalById(localId);

        setLocal(data.local);
        setCostoInicial(data.local.CostoInicial);
        setCostoPeriodico(data.local.CostoPeriodico);
        console.log(data.local);
      } catch (error) {
        console.error(error);
        alert("No se pudo cargar el detalle del local");
      }
    };

    cargarDetalle();
  }, [localId]);

  const seleccionarLocal = () => {
    if (!local) return;
    setSimulationData(entidadId, local.id);
    navigate(`/simulador`);
  };

  if (!local) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6 space-y-4">
      <Card>
        <h2 className="text-lg font-bold">🏢 Local seleccionado</h2>
        <p>Nombre: {local.nombre}</p>
        <p>Dirección: {local.direccion}</p>
        <p>Precio: {local.precio} ({local.moneda})</p>
        <p>Tipo: {local.tipo}</p>
      </Card>

      {costoInicial && (
        <Card>
          <h2 className="text-md font-bold">💰 Costos iniciales</h2>
          <p>Notariales: {costoInicial.costes_notariales}</p>
          {costoInicial.seguro_riesgo && <p>Seguro de riesgo: {costoInicial.seguro_riesgo}</p>}
          <p>Registrales: {costoInicial.costes_registrales}</p>
          <p>Tasación: {costoInicial.tasacion}</p>
          <p>Comisión estudio: {costoInicial.comision_estudio}</p>
          <p>Comisión activación: {costoInicial.comision_activacion}</p>
        </Card>
      )}

      {costoPeriodico && (
        <Card>
          <h2 className="text-md font-bold">🔁 Costos periódicos</h2>
          {costoPeriodico.seguro_contra_todo_riesgo && <p>Seguro todo riesgo: {costoPeriodico.seguro_contra_todo_riesgo}</p>}
          <p>Comisión periódica: {costoPeriodico.comision_periodica}</p>
          <p>Portes: {costoPeriodico.portes}</p>
          <p>Gastos administrativos: {costoPeriodico.gastos_administrativos}</p>
        </Card>
      )}

      <Button onClick={seleccionarLocal}>
        ✅ Seleccionar y Simular Préstamo
      </Button>
    </div>
  );
}
