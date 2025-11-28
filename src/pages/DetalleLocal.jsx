import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getLocalById, updateLocal } from "../api/locales.api";
import { useSimulationStore } from "../store/useSimulationStore";

export default function DetalleLocal() {
  const { localId, entidadId } = useParams();
  const navigate = useNavigate();
  const setSimulationData = useSimulationStore((state) => state.setSimulationData);

  const [local, setLocal] = useState(null);
  const [costoInicial, setCostoInicial] = useState(null);
  const [costoPeriodico, setCostoPeriodico] = useState(null);
  const [isEditing, setIsEditing] = useState(false);


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
    // No need to set simulation data here yet, or maybe we can set localId
    // setSimulationData(null, local.id); 
    navigate(`/local/${local.id}/entidades`);
  };

  const handleCostoInicialChange = (e) => {
    const { name, value } = e.target;
    setCostoInicial((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCostoPeriodicoChange = (e) => {
    const { name, value } = e.target;
    setCostoPeriodico((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSave = async () => {
    try {
      const updatedLocal = {
        ...local,
        CostoInicial: costoInicial,
        CostoPeriodico: costoPeriodico,
      };
      await updateLocal(localId, updatedLocal);
      setLocal(updatedLocal);
      setIsEditing(false);
      alert("Datos actualizados correctamente.");
    } catch (error) {
      console.error("Error actualizando local:", error);
      alert("No se pudo actualizar los datos.");
    }
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
          <h2 className="text-md font-bold mb-2">💰 Costos iniciales</h2>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Notariales" name="costes_notariales" type="number" value={costoInicial.costes_notariales} onChange={handleCostoInicialChange} />
              <Input label="Registrales" name="costes_registrales" type="number" value={costoInicial.costes_registrales} onChange={handleCostoInicialChange} />
              <Input label="Tasación" name="tasacion" type="number" value={costoInicial.tasacion} onChange={handleCostoInicialChange} />
              <Input label="Comisión Estudio" name="comision_estudio" type="number" value={costoInicial.comision_estudio} onChange={handleCostoInicialChange} />
              <Input label="Comisión Activación" name="comision_activacion" type="number" value={costoInicial.comision_activacion} onChange={handleCostoInicialChange} />
              {costoInicial.seguro_riesgo !== undefined && (
                <Input label="Seguro de Riesgo" name="seguro_riesgo" type="number" value={costoInicial.seguro_riesgo} onChange={handleCostoInicialChange} />
              )}
            </div>
          ) : (
            <>
              <p>Notariales: {costoInicial.costes_notariales}</p>
              {costoInicial.seguro_riesgo && <p>Seguro de riesgo: {costoInicial.seguro_riesgo}</p>}
              <p>Registrales: {costoInicial.costes_registrales}</p>
              <p>Tasación: {costoInicial.tasacion}</p>
              <p>Comisión estudio: {costoInicial.comision_estudio}</p>
              <p>Comisión activación: {costoInicial.comision_activacion}</p>
            </>
          )}
        </Card>
      )}

      {costoPeriodico && (
        <Card>
          <h2 className="text-md font-bold mb-2">🔁 Costos periódicos</h2>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Comisión Periódica" name="comision_periodica" type="number" value={costoPeriodico.comision_periodica} onChange={handleCostoPeriodicoChange} />
              <Input label="Portes" name="portes" type="number" value={costoPeriodico.portes} onChange={handleCostoPeriodicoChange} />
              <Input label="Gastos Administrativos" name="gastos_administrativos" type="number" value={costoPeriodico.gastos_administrativos} onChange={handleCostoPeriodicoChange} />
              {costoPeriodico.seguro_contra_todo_riesgo !== undefined && (
                <Input label="Seguro Todo Riesgo" name="seguro_contra_todo_riesgo" type="number" value={costoPeriodico.seguro_contra_todo_riesgo} onChange={handleCostoPeriodicoChange} />
              )}
            </div>
          ) : (
            <>
              {costoPeriodico.seguro_contra_todo_riesgo && <p>Seguro todo riesgo: {costoPeriodico.seguro_contra_todo_riesgo}</p>}
              <p>Comisión periódica: {costoPeriodico.comision_periodica}</p>
              <p>Portes: {costoPeriodico.portes}</p>
              <p>Gastos administrativos: {costoPeriodico.gastos_administrativos}</p>
            </>
          )}
        </Card>
      )}

      <div className="flex gap-4">
        {isEditing ? (
          <>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              Guardar Cambios
            </Button>
            <Button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600">
              Cancelar
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
            Editar Costos
          </Button>
        )}

        <Button onClick={seleccionarLocal} className="bg-green-600 hover:bg-green-700">
          Ver Entidades Financieras
        </Button>
      </div>
    </div>
  );
}
