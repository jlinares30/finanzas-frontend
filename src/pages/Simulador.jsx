import { useState, useEffect } from "react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { crearPlanPago } from "../api/planPago.api"; // Asegúrate de que esto soporte errores
import { useNavigate } from "react-router-dom";
import { getEntidadById } from "../api/entidadFinanciera.api";
import { getLocalById } from "../api/locales.api";
import { useSimulationStore } from "../store/useSimulationStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Simulador() {
  const navigate = useNavigate();

  // IDs desde Store
  const { entidadFinancieraId: entidadFinancieraIdUrl, localId: localIdUrl } = useSimulationStore();
  const user = useAuthStore((state) => state.user);

  // Estados de datos
  const [entidadFinanciera, setEntidadFinanciera] = useState(null); // Iniciar en null para validar carga
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Para mostrar errores del backend

  // Estado del Formulario
  const [form, setForm] = useState({
    cuota_inicial: "",
    bono_aplicable: false,
    num_anios: 5,
    frecuencia_pago: "mensual",
    periodo_gracia_tipo: "SIN_GRACIA",
    periodo_gracia_meses: 0,

    // Datos de Tasa
    tipo_tasa: "EFECTIVA",
    capitalizacion: "mensual",
    tasa_interes_anual: "",
  });

  // Cargar datos al inicio
  useEffect(() => {
    async function fetchData() {
      try {
        const resEntidad = await getEntidadById(entidadFinancieraIdUrl);
        const resLocal = await getLocalById(localIdUrl);

        const entidadData = resEntidad.data;
        const localData = resLocal.data.local;

        setEntidadFinanciera(entidadData);
        setLocal(localData);

        // Pre-llenar formulario con valores por defecto de la entidad
        setForm(prev => ({
          ...prev,
          //Si el banco trae datos, úsalos como default.
          tipo_tasa: entidadData.tipo_tasa || "EFECTIVA",
          capitalizacion: entidadData.capitalizacion || "mensual",
          //Convertimos a porcentaje visual (ej: 0.10 -> 10)
          tasa_interes_anual: entidadData.tasa_interes ? entidadData.tasa_interes * 100 : ""
        }));

      } catch (err) {
        console.error("Error cargando datos", err);
        setError("Error cargando la información del inmueble o banco.");
      }
    }

    if (entidadFinancieraIdUrl && localIdUrl) {
      fetchData();
    }
  }, [entidadFinancieraIdUrl, localIdUrl]);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const simulate = async () => {
    setLoading(true);
    setError(null);

    try {
      if (Number(form.cuota_inicial) >= Number(local.precio)) {
        throw new Error("La cuota inicial no puede ser mayor o igual al precio del inmueble.");
      }

      const payload = {
        localId: local.id,
        userId: user.id,
        entidadFinancieraId: entidadFinanciera.id,
        precio_venta: Number(local.precio),

        cuota_inicial: Number(form.cuota_inicial),
        bono_aplicable: form.bono_aplicable,
        num_anios: Number(form.num_anios),
        frecuencia_pago: form.frecuencia_pago,

        tipo_tasa: form.tipo_tasa,
        tasa_interes_anual: Number(form.tasa_interes_anual) / 100,

        capitalizacion: form.tipo_tasa === 'NOMINAL' ? form.capitalizacion : null,

        periodo_gracia: {
          tipo: form.periodo_gracia_tipo,
          meses: Number(form.periodo_gracia_meses)
        }
      };

      const resp = await crearPlanPago(payload);

      // Si todo sale bien, navegar
      navigate("/resultado", { state: resp.data });

    } catch (err) {
      // Manejar el error que viene del backend (ej: "No califica al bono")
      const msg = err.response?.data?.message || err.message || "Error al realizar la simulación";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Render condicional de carga
  if (!entidadFinanciera || !local) return <div className="p-4">Cargando datos del simulador...</div>;

  const monedaSymbol = local.moneda === 'USD' ? '$' : 'S/';

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-gray-800">Simulador de Crédito Hipotecario</h2>

      {/* Mensaje de Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">

        {/* SECCIÓN 1: DATOS DEL INMUEBLE */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Local Seleccionado" value={local.nombre} disabled />
          <Input label={`Precio Venta (${local.moneda})`} value={`${monedaSymbol} ${local.precio}`} disabled />
        </div>

        {/* SECCIÓN 2: DATOS DEL CRÉDITO */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`Cuota Inicial (${monedaSymbol})`}
            name="cuota_inicial"
            type="number"
            value={form.cuota_inicial}
            onChange={update}
            placeholder="Ej. 20000"
          />
          <Input
            label="Plazo (Años)"
            name="num_anios"
            type="number"
            value={form.num_anios}
            onChange={update}
          />
          <Select
            label="Frecuencia de Pago"
            name="frecuencia_pago"
            value={form.frecuencia_pago}
            onChange={update}
          >
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </Select>

        </div>

        {/* SECCIÓN 3: TASAS (Requisito: Nominal/Efectiva y Capitalización) */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg my-4">
          <h3 className="text-sm font-bold text-blue-800 mb-3">Configuración de Tasa de Interés</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* A. Selector de Tipo de Tasa */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Tasa</label>
              <select
                name="tipo_tasa"
                value={form.tipo_tasa}
                onChange={update}
                className="w-full p-2 border rounded"
              >
                <option value="EFECTIVA">Efectiva (TEA)</option>
                <option value="NOMINAL">Nominal (TNA)</option>
              </select>
            </div>

            {/* B. Input de Valor de Tasa */}
            <Input
              label="Tasa Anual (%)"
              name="tasa_interes_anual"
              type="number"
              step="0.01"
              value={form.tasa_interes_anual}
              onChange={update}
            />

            {/* C. Selector de Capitalización (Solo si es Nominal) */}
            {form.tipo_tasa === "NOMINAL" ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Capitalización</label>
                <select
                  name="capitalizacion"
                  value={form.capitalizacion}
                  onChange={update}
                  className="w-full p-2 border rounded"
                >
                  <option value="diaria">Diaria</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                  <option value="bimestral">Bimestral</option>
                  <option value="semestral">Semestral</option>
                </select>
              </div>
            ) : (
              <div className="flex items-end pb-2">
                <span className="text-xs text-gray-400">La tasa efectiva ya incluye capitalización.</span>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 4: TECHO PROPIO */}
        <div className="border-t pt-4">
          {entidadFinanciera.aplica_bono_techo_propio ? (
            <>
              <Select
                label="¿Solicitar Bono Techo Propio?"
                name="bono_aplicable"
                value={form.bono_aplicable ? "1" : "0"}
                onChange={(e) => setForm({ ...form, bono_aplicable: e.target.value === "1" })}
              >
                <option value="0">No aplicar bono</option>
                <option value="1">Sí, solicitar bono</option>
              </Select>
              {form.bono_aplicable && (
                <p className="text-xs text-blue-600 mt-1">
                  * Se validarán sus ingresos (Máx S/ 3,715) y el precio del inmueble (Máx S/ 128,900).
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Esta entidad financiera no aplica al programa Techo Propio.</p>
          )}
        </div>

        {/* SECCIÓN 5: PERIODO DE GRACIA */}
        <div className="border-t pt-4">
          {entidadFinanciera.periodos_gracia_permitidos === "SIN_GRACIA" ? (
            <p className="text-sm text-gray-500">Esta entidad no ofrece periodos de gracia.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tipo de Gracia"
                name="periodo_gracia_tipo"
                value={form.periodo_gracia_tipo}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    periodo_gracia_tipo: val,
                    periodo_gracia_meses: val === "SIN_GRACIA" ? 0 : form.periodo_gracia_meses
                  });
                }}
              >
                <option value="SIN_GRACIA">Sin Gracia</option>

                {(entidadFinanciera.periodos_gracia_permitidos === "PARCIAL" || entidadFinanciera.periodos_gracia_permitidos === "AMBOS") && (
                  <option value="PARCIAL">Parcial (Paga intereses)</option>
                )}
                {(entidadFinanciera.periodos_gracia_permitidos === "TOTAL" || entidadFinanciera.periodos_gracia_permitidos === "AMBOS") && (
                  <option value="TOTAL">Total (No paga nada)</option>
                )}
              </Select>

              <Input
                label={`Meses de Gracia (Máx: ${entidadFinanciera.max_meses_gracia})`}
                type="number"
                name="periodo_gracia_meses"
                value={form.periodo_gracia_meses}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= entidadFinanciera.max_meses_gracia) {
                    setForm({ ...form, periodo_gracia_meses: e.target.value });
                  }
                }}
                disabled={form.periodo_gracia_tipo === "SIN_GRACIA"}
              />
            </div>
          )}
        </div>

        <Button onClick={simulate} disabled={loading}>
          {loading ? "Calculando..." : "Generar Plan de Pagos"}
        </Button>
      </div>
    </Card>
  );
}