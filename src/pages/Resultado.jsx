import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { formatMoney, formatPercent } from "../utils/format";

export default function Resultado() {
  const { state } = useLocation();
  const [showDiagnostico, setShowDiagnostico] = useState(false);

  if (!state) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-400 mb-4">No hay resultados disponibles</h2>
        <Link to="/simulador"><Button>Iniciar Nueva Simulación</Button></Link>
    </div>
  );

  const { plan, cuotas, indicadores, flujoInicial } = state;
  const currency = plan.moneda || "PEN";

  // --- DIAGNÓSTICO FINANCIERO ---
  const renderDiagnostico = () => {
    const cok = Number(plan.cok);
    const tcea = Number(indicadores.tcea);

    if (!cok || cok === 0) return (
        <div className="text-center p-6 text-gray-500">
            No ingresaste un COK (Costo de Oportunidad), por lo que no podemos generar una recomendación de inversión.
        </div>
    );

    const esConveniente = tcea < cok;

    return (
      <div className={`p-6 rounded-xl border-2 ${esConveniente ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
        <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{esConveniente ? "🚀" : "🛑"}</span>
            <div>
                <h3 className={`font-bold text-xl ${esConveniente ? 'text-green-800' : 'text-orange-800'}`}>
                {esConveniente ? "Escenario Favorable" : "Escenario Costoso"}
                </h3>
                <p className="text-sm opacity-80 font-medium">Análisis de viabilidad financiera</p>
            </div>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {esConveniente
            ? `¡Buenas noticias! La TCEA del crédito (${formatPercent(tcea)}) es inferior a tu rentabilidad esperada (COK ${formatPercent(cok)}). Esto significa que estás generando valor al usar el dinero del banco.`
            : `Precaución. El costo real del crédito (${formatPercent(tcea)}) supera lo que rinde tu dinero (${formatPercent(cok)}). Estás destruyendo valor financiero. Considera aumentar la cuota inicial o buscar una mejor tasa.`
          }
        </p>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans text-gray-800">
      
      {/* HEADER DE ACCIONES */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Resultado de la Simulación</h1>
            <p className="text-gray-500">Calculado el {new Date(plan.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/">
            <Button className="bg-green text-gray-700 border border-gray-300 hover:bg-gray-50">Inicio</Button>
          </Link>
          <Link to="/simulador">
            <Button className="bg-blue-600 hover:bg-blue-700">Nueva Simulación</Button>
          </Link>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: El Inmueble */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-500 relative overflow-hidden flex flex-col h-full">
            <div className="absolute -right-4 -top-4 text-blue-50 text-9xl opacity-20 pointer-events-none">🏢</div>
            <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">1. El Inmueble</h3>
            
            <div className="mb-4">
               <span className="block text-sm text-gray-600 mb-1">Precio Venta</span>
               <span className="text-2xl font-bold text-gray-800">{formatMoney(plan.precio_venta, currency)}</span>
            </div>

            <div className="space-y-3 text-sm flex-1">
                {/* Conversión de Moneda (Restaurado) */}
                {plan.tipo_cambio_usado !== 1 && (
                    <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 border border-blue-100 font-medium">
                      * Convertido con T.C. {Number(plan.tipo_cambio_usado).toFixed(3)}
                    </div>
                )}
            
                <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                    <span className="text-gray-600">Cuota Inicial:</span>
                    <span className="font-semibold text-red-500">- {formatMoney(plan.cuota_inicial, currency)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                    <span className="text-gray-600">Bono Techo Propio:</span>
                    <span className="font-semibold text-green-600">
                        {Number(plan.bono_aplicable) > 0 ? `- ${formatMoney(plan.bono_aplicable, currency)}` : "No aplica"}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-800">A Financiar:</span>
                    <span className="font-bold text-xl text-blue-800">{formatMoney(plan.monto_prestamo, currency)}</span>
                </div>
            </div>
        </div>

        {/* Card 2: El Crédito */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-500 relative overflow-hidden flex flex-col h-full">
            <div className="absolute -right-4 -top-4 text-green-50 text-9xl opacity-20 pointer-events-none">🏦</div>
            <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">2. Condiciones del Banco</h3>
            
             <div className="mb-4 flex items-center gap-2">
               <div>
                   <span className="block text-sm text-gray-600 mb-1">Tasa Interés (TEA)</span>
                   <span className="text-2xl font-bold text-gray-800">{formatPercent(indicadores.TEA)}</span>
               </div>
            </div>

            <div className="space-y-3 text-sm flex-1 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Plazo Total:</span>
                    <span className="font-semibold text-gray-800">{plan.num_anios} años ({plan.total_cuotas} cuotas)</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Frecuencia Pago:</span>
                    <span className="font-semibold text-gray-800 capitalize">{plan.frecuencia_pago}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Periodo de Gracia:</span>
                    <span className="font-semibold text-gray-800 capitalize">
                        {plan.tipo_gracia ? plan.tipo_gracia.replace('_', ' ') : 'Sin Gracia'}
                    </span>
                </div>
                
                {/* Restaurado detalle de meses de gracia */}
                {plan.meses_gracia > 0 && (
                  <div className="flex justify-between items-center bg-orange-50 p-2 rounded text-orange-800 text-xs border border-orange-100">
                    <span>Duración Gracia:</span>
                    <span className="font-bold">{plan.meses_gracia} meses</span>
                  </div>
                )}
            </div>
        </div>

        {/* Card 3: Indicadores */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                 <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">3. Rentabilidad y Costo</h3>
                 <button onClick={() => setShowDiagnostico(true)} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors">
                    ℹ️ Ver Análisis
                 </button>
            </div>
            
            <div className="mb-4">
                 <span className="block text-sm text-gray-400 mb-1">TCEA (Costo Real)</span>
                 <span className={`text-3xl font-bold ${Number(indicadores.tcea) > Number(plan.cok) && Number(plan.cok) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    {formatPercent(indicadores.tcea)}
                 </span>
            </div>

            <div className="space-y-3 text-sm flex-1 border-t border-gray-700 pt-3">
                <div className="flex justify-between">
                    <span className="text-gray-400">Total Intereses:</span>
                    <span className="font-semibold text-white">{formatMoney(plan.total_intereses, currency)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">VAN (Valor Actual Neto):</span>
                    <span className={`font-semibold ${indicadores.van < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatMoney(indicadores.van, currency)}
                    </span>
                </div>
                {/* COK Restaurado */}
                <div className="flex justify-between">
                    <span className="text-gray-400">Tasa Descuento (COK):</span>
                    <span className="font-semibold text-white">{formatPercent(plan.cok)}</span>
                </div>
            </div>

            {/* Desembolso Neto Restaurado */}
            <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-300">Desembolso Neto:</span>
                    <span className="font-bold text-xl text-white">{formatMoney(flujoInicial, currency)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* TABLA DE PAGOS */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-5 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 text-lg">Cronograma de Pagos</h3>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300">
          <table className="w-full text-xs text-right border-collapse">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 text-center border-b">#</th>
                <th className="p-4 border-b">Saldo Inicial</th>
                <th className="p-4 border-b text-green-700">Amortización</th>
                <th className="p-4 border-b text-red-700">Interés</th>
                <th className="p-4 bg-yellow-50 border-b text-yellow-800">Seg. Desg.</th>
                <th className="p-4 bg-yellow-50 border-b text-yellow-800">Seg. Riesgo</th>
                <th className="p-4 bg-yellow-50 border-b text-yellow-800">Gastos</th>
                <th className="p-4 bg-blue-50 border-b text-blue-900 border-l border-blue-100">Cuota Total</th>
                <th className="p-4 border-b">Saldo Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {cuotas?.map((c) => (
                <tr key={c.numero} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 text-center font-medium text-gray-400">{c.numero}</td>
                  <td className="p-4 text-gray-600">{formatMoney(c.saldo_inicial, currency)}</td>
                  <td className="p-4 font-medium text-green-600">{formatMoney(c.amortizacion, currency)}</td>
                  <td className="p-4 text-red-500">{formatMoney(c.interes, currency)}</td>

                  <td className="p-4 bg-yellow-50/20 text-gray-500">{formatMoney(c.seguro_desgravamen, currency)}</td>
                  <td className="p-4 bg-yellow-50/20 text-gray-500">{formatMoney(c.seguro_riesgo, currency)}</td>
                  <td className="p-4 bg-yellow-50/20 text-gray-500">
                    {formatMoney(Number(c.comision) + Number(c.portes) + Number(c.gastos_administrativos), currency)}
                  </td>

                  <td className="p-4 font-bold text-blue-800 bg-blue-50/30 border-l border-blue-100">
                    {formatMoney(Math.abs(c.flujo), currency)}
                  </td>

                  <td className="p-4 text-gray-500">{formatMoney(c.saldo_final, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showDiagnostico} onClose={() => setShowDiagnostico(false)} title="Diagnóstico Financiero">
        {renderDiagnostico()}
      </Modal>
    </div>
  );
}