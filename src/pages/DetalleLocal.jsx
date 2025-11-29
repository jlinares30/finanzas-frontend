import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getLocalById, updateLocal } from "../api/locales.api";
import { useSimulationStore } from "../store/useSimulationStore";
import { formatMoney } from "../utils/format";

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

  if (!local) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="font-medium">Volver</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Detalles de la Propiedad</h1>
        <p className="text-lg text-gray-600">Revisa y edita los costos asociados</p>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <div className="flex items-start gap-4">
          <span className="text-5xl">🏢</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{local.nombre}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-1">Dirección</p>
                <p className="font-semibold text-gray-800">{local.direccion}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-1">Precio</p>
                <p className="font-bold text-green-600 text-lg">{formatMoney(local.precio, local.moneda)}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-1">Tipo</p>
                <p className="font-semibold text-gray-800">{local.tipo}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {costoInicial && (
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">💰</span>
              Costos Iniciales
            </h2>
            {!isEditing && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">Una sola vez</span>
            )}
          </div>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Notariales</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoInicial.costes_notariales, local.moneda)}</p>
              </div>
              {costoInicial.seguro_riesgo && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Seguro de riesgo</p>
                  <p className="text-lg font-bold text-gray-800">{formatMoney(costoInicial.seguro_riesgo, local.moneda)}</p>
                </div>
              )}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Registrales</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoInicial.costes_registrales, local.moneda)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Tasación</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoInicial.tasacion, local.moneda)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Comisión estudio</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoInicial.comision_estudio, local.moneda)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Comisión activación</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoInicial.comision_activacion, local.moneda)}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {costoPeriodico && (
        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">🔁</span>
              Costos Periódicos
            </h2>
            {!isEditing && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">Mensuales</span>
            )}
          </div>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Comisión Periódica" name="comision_periodica" type="number" value={costoPeriodico.comision_periodica} onChange={handleCostoPeriodicoChange} />
              <Input label="Portes" name="portes" type="number" value={costoPeriodico.portes} onChange={handleCostoPeriodicoChange} />
              <Input label="Gastos Administrativos" name="gastos_administrativos" type="number" value={costoPeriodico.gastos_administrativos} onChange={handleCostoPeriodicoChange} />
              {costoPeriodico.seguro_contra_todo_riesgo !== undefined && (
                <Input label="Seguro Todo Riesgo" name="seguro_contra_todo_riesgo" type="number" value={costoPeriodico.seguro_contra_todo_riesgo} onChange={handleCostoPeriodicoChange} />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {costoPeriodico.seguro_contra_todo_riesgo && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Seguro todo riesgo</p>
                  <p className="text-lg font-bold text-gray-800">{formatMoney(costoPeriodico.seguro_contra_todo_riesgo, local.moneda)}</p>
                </div>
              )}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Comisión periódica</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoPeriodico.comision_periodica, local.moneda)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Portes</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoPeriodico.portes, local.moneda)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1 font-medium">Gastos administrativos</p>
                <p className="text-lg font-bold text-gray-800">{formatMoney(costoPeriodico.gastos_administrativos, local.moneda)}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="flex flex-wrap gap-4 pt-4">
        {isEditing ? (
          <>
            <Button onClick={handleSave} className="px-8 py-3">
              Guardar Cambios
            </Button>
            <Button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-600 px-8 py-3">
              Cancelar
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
            Editar Costos
          </Button>
        )}

        <Button onClick={seleccionarLocal} className="px-8 py-3">
          Ver Entidades Financieras
        </Button>
      </div>
    </div>
  );
}