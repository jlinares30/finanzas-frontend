import { useState, useEffect } from "react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { crearPlanPago } from "../api/planPago.api";
import { useNavigate } from "react-router-dom";
import { getEntidadById } from "../api/entidadFinanciera.api";
import { getLocalById } from "../api/locales.api";
import { useSimulationStore } from "../store/useSimulationStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMoney } from "../utils/format";

export default function Simulador() {
  const navigate = useNavigate();

  const { entidadFinancieraId: entidadFinancieraIdUrl, localId: localIdUrl } = useSimulationStore();
  const user = useAuthStore((state) => state.user);

  // Estados de datos
  const [entidadFinanciera, setEntidadFinanciera] = useState(null);
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tipoCambio, setTipoCambio] = useState(3.5);

  // Estado del Formulario
  const [form, setForm] = useState({
    cuota_inicial: "",
    bono_aplicable: false,
    num_anios: 5,
    frecuencia_pago: "mensual",
    periodo_gracia_tipo: "SIN_GRACIA",
    periodo_gracia_meses: 0,
    cok: "",

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
          tipo_tasa: entidadData.tipo_tasa || "EFECTIVA",
          capitalizacion: entidadData.capitalizacion || "mensual",
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
        tipo_cambio: Number(tipoCambio),
        tipo_tasa: form.tipo_tasa,
        tasa_interes_anual: Number(form.tasa_interes_anual) / 100,
        cok: form.cok ? Number(form.cok) / 100 : 0,
        capitalizacion: form.tipo_tasa === 'NOMINAL' ? form.capitalizacion : null,

        periodo_gracia: {
          tipo: form.periodo_gracia_tipo,
          meses: Number(form.periodo_gracia_meses)
        }
      };

      const resp = await crearPlanPago(payload);

      navigate("/resultado", { state: resp.data });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error al realizar la simulación";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!entidadFinanciera || !local) return <div className="p-8 text-center text-gray-500">Cargando datos del simulador...</div>;

  const monedaSymbol = local.moneda === 'USD' ? '$' : 'S/';
  const monedaLocal = local.moneda;
  const monedaBanco = entidadFinanciera.moneda;
  const necesitaConversion = monedaLocal !== monedaBanco;

  const getStepGracia = (frecuencia) => {
    switch (frecuencia) {
      case "mensual": return 1;
      case "bimestral": return 2;
      case "trimestral": return 3;
      case "cuatrimestral": return 4;
      case "semestral": return 6;
      case "anual": return 12;
      default: return 1;
    }
  };

  const stepGracia = getStepGracia(form.frecuencia_pago);

  const handleBlurGracia = () => {
    const valorActual = Number(form.periodo_gracia_meses);

    // Si no es múltiplo exacto, lo forzamos al más cercano
    if (valorActual % stepGracia !== 0) {
      const valorCorregido = Math.floor(valorActual / stepGracia) * stepGracia;

      setForm({ ...form, periodo_gracia_meses: valorCorregido });
    }
  };

  return (
    <div className="p-8 min-h-screen flex justify-center">
      <Card className="max-w-3xl w-full relative overflow-hidden">
        {/* Header Decorativo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
        
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Simulador de Crédito</h2>
          <p className="text-gray-500">Configura los parámetros de tu financiamiento</p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <strong className="font-bold block">Error en la simulación</strong>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8">

          {/* SECCIÓN 1: DATOS DEL INMUEBLE */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🏢</span> Datos del Inmueble
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <Input label="Local Seleccionado" value={local.nombre} disabled />
              <Input label={`Precio Venta (${local.moneda})`} value={`${formatMoney(local.precio, local.moneda)}`} disabled />
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL CRÉDITO */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💰</span> Parámetros del Crédito
            </h3>
            <div className="grid grid-cols-2 gap-6">
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
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="cuatrimestral">Cuatrimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </Select>

            </div>
          </div>

          {/* SECCIÓN 3: TASAS */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
              <span>📉</span> Tasa de Interés
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* A. Selector de Tipo de Tasa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Tasa</label>
                <div className="relative">
                  <select
                    name="tipo_tasa"
                    value={form.tipo_tasa}
                    onChange={update}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer appearance-none"
                  >
                    <option value="EFECTIVA">Efectiva (TEA)</option>
                    <option value="NOMINAL">Nominal (TNA)</option>
                  </select>
                </div>
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

              {/* C. Selector de Capitalización */}
              {form.tipo_tasa === "NOMINAL" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capitalización</label>
                  <div className="relative">
                    <select
                      name="capitalizacion"
                      value={form.capitalizacion}
                      onChange={update}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer appearance-none"
                    >
                      <option value="diaria">Diaria</option>
                      <option value="mensual">Mensual</option>
                      <option value="bimestral">Bimestral</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="cuatrimestral">Cuatrimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex items-end pb-3">
                  <span className="text-xs text-blue-400 font-medium bg-blue-50 px-2 py-1 rounded">ℹ️ La tasa efectiva ya incluye capitalización.</span>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 4: TECHO PROPIO */}
          <div className="border-t border-gray-100 pt-6">
            {entidadFinanciera.aplica_bono_techo_propio ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
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
                  <p className="text-xs text-green-700 mt-2 font-medium flex items-center gap-1">
                    <span>✅</span> Se validarán sus ingresos (Máx S/ 3,715) y el precio del inmueble (Máx S/ 128,900).
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-gray-50 text-gray-400 italic text-sm text-center border border-gray-100">
                Esta entidad financiera no aplica al programa Techo Propio.
              </div>
            )}
          </div>

          {/* SECCIÓN 5: PERIODO DE GRACIA */}
          <div className="pt-2">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⏳</span> Periodo de Gracia
            </h3>
            {entidadFinanciera.periodos_gracia_permitidos === "SIN_GRACIA" ? (
               <div className="p-4 rounded-lg bg-gray-50 text-gray-400 italic text-sm text-center border border-gray-100">
                Esta entidad no ofrece periodos de gracia.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
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

                <div>
                  <Input
                    label={`Meses de Gracia (Máx: ${entidadFinanciera.max_meses_gracia})`}
                    type="number"
                    name="periodo_gracia_meses"
                    value={form.periodo_gracia_meses}
                    step={stepGracia}
                    min={0}
                    max={entidadFinanciera.max_meses_gracia}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= entidadFinanciera.max_meses_gracia) {
                        setForm({ ...form, periodo_gracia_meses: e.target.value });
                      }
                    }}
                    onBlur={handleBlurGracia}
                    disabled={form.periodo_gracia_tipo === "SIN_GRACIA"}
                  />

                  {/* FEEDBACK VISUAL */}
                  {Number(form.periodo_gracia_meses) % stepGracia !== 0 && (
                    <p className="text-xs text-orange-600 mt-1 font-bold">
                      ⚠️ Ajustando a múltiplo de {stepGracia} meses...
                    </p>
                  )}

                  <p className="text-[11px] text-gray-500 mt-1">
                    * Pagos {form.frecuencia_pago}: gracia debe ser cada {stepGracia} meses.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Evaluación Financiera (Opcional)</h3>
            <Input
              label="COK (Costo de Oportunidad) - Anual %"
              name="cok"
              type="number"
              step="0.01"
              placeholder="Ej. 10 (Si tienes otra inversión)"
              value={form.cok}
              onChange={update}
              helperText="Tasa de descuento para calcular el VAN."
            />
          </div>

          {/* AVISO DE CONVERSIÓN DE MONEDA */}
          {necesitaConversion && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm text-sm">
              <h4 className="font-bold text-yellow-800 flex items-center gap-2 text-base">
                💱 Conversión de Moneda Requerida
              </h4>
              <p className="text-yellow-700 mt-1 mb-3">
                El inmueble está en <strong>{monedaLocal}</strong> pero el crédito será en <strong>{monedaBanco}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-6 items-center bg-white/50 p-3 rounded-lg">
                <Input
                  label="Tipo de Cambio (Referencial)"
                  type="number"
                  step="0.01"
                  value={tipoCambio}
                  onChange={(e) => setTipoCambio(e.target.value)}
                  className="mb-0"
                />
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Precio convertido</p>
                  <p className="font-extrabold text-xl text-gray-800">
                    {monedaBanco === 'PEN' ? 'S/' : '$'}
                    {monedaBanco === 'PEN'
                      ? (local.precio * tipoCambio).toLocaleString('es-PE', { minimumFractionDigits: 2 })
                      : (local.precio / tipoCambio).toLocaleString('es-PE', { minimumFractionDigits: 2 })
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          <Button onClick={simulate} disabled={loading} className="w-full py-4 text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all">
            {loading ? "Calculando..." : "Generar Plan de Pagos"}
          </Button>
        </div>
      </Card>
    </div>
  );
}