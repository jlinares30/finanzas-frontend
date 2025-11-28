import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { formatMoney, formatPercent } from "../utils/format";

export default function Resultado() {
  const { state } = useLocation();
  const [showDiagnostico, setShowDiagnostico] = useState(false);

  if (!state) return <div className="p-8 text-center text-gray-500">No hay resultados para mostrar. Inicia una nueva simulación.</div>;

  const { plan, cuotas, indicadores, flujoInicial } = state;

  // Helpers de formato
  const currency = plan.moneda || "PEN";

  console.log(plan);

  // --- DIAGNÓSTICO FINANCIERO ---
  const renderDiagnostico = () => {
    const cok = Number(plan.cok);
    const tcea = Number(indicadores.tcea);

    // Si el usuario no puso COK (es 0), no podemos opinar
    if (!cok || cok === 0) return null;

    const esConveniente = tcea < cok;

    return (
      <div className={`p-4 rounded-lg border-l-4 mb-6 shadow-sm ${esConveniente ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-500'}`}>
        <h3 className={`font-bold text-lg ${esConveniente ? 'text-green-800' : 'text-orange-800'}`}>
          {esConveniente ? "✅ Oportunidad Financiera (Apalancamiento Positivo)" : "⚠️ Costo Financiero Elevado"}
        </h3>
        <p className="text-sm text-gray-700 mt-1">
          {esConveniente
            ? `¡Te conviene! La TCEA del banco (${formatPercent(tcea)}) es menor a tu capacidad de inversión (COK ${formatPercent(cok)}). Estás obteniendo financiamiento "barato" respecto a lo que rinde tu dinero.`
            : `Cuidado. El crédito te cuesta (${formatPercent(tcea)}), que es más de lo que rinde tu dinero (${formatPercent(cok)}). Financieramente, te convendría pagar una cuota inicial mayor para endeudarte menos.`
          }
        </p>
      </div>
    );
  };
  // ----------------------------------------

  return (
    <div className="p-4 max-w-6xl mx-auto flex flex-col gap-6 font-sans text-gray-800">

      {/* 1. ENCABEZADO Y ACCIONES */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">Resultado de la Simulación</h1>
          <p className="text-sm text-gray-500 mt-1">
            Calculado el {new Date(plan.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/">
            <Button variant="outline">Inicio</Button>
          </Link>
          <Link to="/simulador">
            <Button>Nueva Simulación</Button>
          </Link>
        </div>
      </div>

      {/* 2. TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* COLUMNA 1: EL INMUEBLE */}
        <Card className="h-full flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-3">1. El Inmueble</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Precio Venta:</span>
                <span className="font-medium">{formatMoney(plan.precio_venta, currency)}</span>
              </div>

              {/* Conversión de Moneda */}
              {plan.tipo_cambio_usado !== 1 && (
                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 border border-blue-100">
                  * Convertido con T.C. {Number(plan.tipo_cambio_usado).toFixed(3)}
                </div>
              )}

              <div className="flex justify-between text-red-600">
                <span>Cuota Inicial:</span>
                <span>- {formatMoney(plan.cuota_inicial, currency)}</span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Bono Techo Propio:</span>
                <span>
                  {Number(plan.bono_aplicable) > 0 ? `- ${formatMoney(plan.bono_aplicable, currency)}` : "No aplica"}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg text-blue-900 bg-blue-50 -mx-4 -mb-4 p-4 rounded-b-lg">
            <span>A Financiar:</span>
            <span>{formatMoney(plan.monto_prestamo, currency)}</span>
          </div>
        </Card>

        {/* COLUMNA 2: EL CRÉDITO */}
        <Card className="h-full">
          <h3 className="font-bold text-gray-700 border-b pb-2 mb-3">2. Condiciones del Banco</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa Interés (TEA):</span>
              <span className="font-bold bg-gray-100 px-2 py-1 rounded">{formatPercent(indicadores.TEA)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plazo Total:</span>
              <span className="font-medium">{plan.num_anios} años ({plan.total_cuotas} cuotas)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frecuencia Pago:</span>
              <span className="capitalize font-medium">{plan.frecuencia_pago}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Periodo de Gracia:</span>
              <span className="capitalize font-medium">{plan.tipo_gracia ? plan.tipo_gracia.replace('_', ' ') : 'Sin Gracia'}</span>
            </div>
            {plan.meses_gracia > 0 && (
              <div className="flex justify-between bg-orange-50 p-2 rounded text-orange-800 text-xs border border-orange-100">
                <span>Duración Gracia:</span>
                <span className="font-bold">{plan.meses_gracia} meses</span>
              </div>
            )}
          </div>
        </Card>

        {/* COLUMNA 3: INDICADORES */}
        <Card className="h-full border-l-4 border-l-purple-600 bg-gradient-to-br from-white to-purple-50">
          <div className="flex justify-between items-center border-b border-purple-100 pb-2 mb-3">
            <h3 className="font-bold text-purple-800">3. Rentabilidad y Costo</h3>
            <button
              onClick={() => setShowDiagnostico(true)}
              className="text-xs text-purple-600 hover:text-purple-800 underline flex items-center gap-1"
            >
              <span>ℹ️ Ver Análisis</span>
            </button>
          </div>

          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-600 text-sm font-medium">TCEA (Costo Real):</span>
            <span className={`text-3xl font-bold ${Number(indicadores.tcea) > Number(plan.cok) && Number(plan.cok) > 0 ? 'text-orange-600' : 'text-purple-700'}`}>
              {formatPercent(indicadores.tcea)}
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-600 bg-white p-3 rounded border border-purple-100 shadow-sm">
            <div className="flex justify-between">
              <span>Total Intereses a Pagar:</span>
              <span className="font-semibold text-gray-800">{formatMoney(plan.total_intereses, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAN (Valor Actual Neto):</span>
              <span className={`font-semibold ${indicadores.van < 0 ? 'text-red-500' : 'text-green-600'}`}>
                {formatMoney(indicadores.van, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tasa Descuento (COK):</span>
              <span>{formatPercent(plan.cok)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-medium">Desembolso Neto:</span>
              <span className="font-bold text-gray-800">{formatMoney(flujoInicial, currency)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. TABLA DE PAGOS */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Cronograma de Pagos</h3>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-right border-collapse">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 text-center border-b">#</th>
                <th className="p-3 border-b">Saldo Inicial</th>
                <th className="p-3 border-b">Amortización</th>
                <th className="p-3 border-b">Interés</th>
                <th className="p-3 bg-yellow-50 border-b text-yellow-800">Seg. Desg.</th>
                <th className="p-3 bg-yellow-50 border-b text-yellow-800">Seg. Riesgo</th>
                <th className="p-3 bg-yellow-50 border-b text-yellow-800">Gastos</th>
                <th className="p-3 bg-blue-50 border-b text-blue-900 border-l border-blue-100">Cuota Total</th>
                <th className="p-3 border-b">Saldo Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {cuotas?.map((c) => (
                <tr key={c.numero} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-center text-gray-400 font-medium">{c.numero}</td>
                  <td className="p-3 text-gray-600">{formatMoney(c.saldo_inicial, currency)}</td>
                  <td className="p-3 font-medium text-green-600">{formatMoney(c.amortizacion, currency)}</td>
                  <td className="p-3 text-red-500">{formatMoney(c.interes, currency)}</td>

                  <td className="p-3 bg-yellow-50/30 text-gray-500">{formatMoney(c.seguro_desgravamen, currency)}</td>
                  <td className="p-3 bg-yellow-50/30 text-gray-500">{formatMoney(c.seguro_riesgo, currency)}</td>
                  <td className="p-3 bg-yellow-50/30 text-gray-500">
                    {formatMoney(Number(c.comision) + Number(c.portes) + Number(c.gastos_administrativos), currency)}
                  </td>

                  <td className="p-3 bg-blue-50 font-bold text-blue-800 border-l border-blue-100">
                    {formatMoney(Math.abs(c.flujo), currency)}
                  </td>

                  <td className="p-3 text-gray-400">{formatMoney(c.saldo_final, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showDiagnostico} onClose={() => setShowDiagnostico(false)} title="Diagnóstico Financiero">
        {renderDiagnostico()}
      </Modal>
    </div>
  );
}