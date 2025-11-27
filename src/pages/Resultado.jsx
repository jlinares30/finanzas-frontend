// import { useLocation, Link } from "react-router-dom";
// import Card from "../components/ui/Card";
// import Button from "../components/ui/Button";

// export default function Resultado() {
//   const { state } = useLocation();
//   const { message, plan, cuotas, indicadores, flujoInicial } = state;

//   return (
//     <div className="flex flex-col gap-6">

//       <Card>
//         <h2 className="text-xl font-bold mb-2">Resultado</h2>
//         <p className="text-sm mb-3">{message}</p>

//         <h3 className="font-semibold mt-4">Plan General</h3>
//         <pre className="bg-gray-200 p-3 rounded text-xs overflow-auto">
//           {JSON.stringify(plan, null, 2)}
//         </pre>

//         <h3 className="font-semibold mt-4">Indicadores Financieros</h3>
//         <pre className="bg-gray-200 p-3 rounded text-xs overflow-auto">
//           {JSON.stringify(indicadores, null, 2)}
//         </pre>

//         <h3 className="font-semibold mt-4">Flujo inicial</h3>
//         <p className="text-sm">{flujoInicial}</p>

//         <Link to="/simulador">
//           <Button className="mt-4">Nueva Simulación</Button>
//         </Link>
//       </Card>

//       <Card>
//         <h3 className="text-lg font-bold mb-2">Cuotas</h3>

//         <div className="overflow-auto max-h-[600px] text-xs">
//           <table className="min-w-full border">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="border p-1">#</th>
//                 <th className="border p-1">Saldo Inicial</th>
//                 <th className="border p-1">Interés</th>
//                 <th className="border p-1">Cuota</th>
//                 <th className="border p-1">Amortización</th>
//                 <th className="border p-1">Saldo Final</th>
//               </tr>
//             </thead>
//             <tbody>
//               {cuotas?.map((c) => (
//                 <tr key={c.numero}>
//                   <td className="border p-1">{c.numero}</td>
//                   <td className="border p-1">{c.saldo_inicial}</td>
//                   <td className="border p-1">{c.interes}</td>
//                   <td className="border p-1">{c.cuota}</td>
//                   <td className="border p-1">{c.amortizacion}</td>
//                   <td className="border p-1">{c.saldo_final}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card>

//     </div>
//   );
// }


import { useLocation, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Resultado() {
  const { state } = useLocation();

  if (!state) return <div className="p-4">No hay resultados para mostrar.</div>;

  const { plan, cuotas, indicadores, flujoInicial } = state;

  // Helper para formatear dinero según la moneda del plan
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: plan.moneda || "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper para porcentajes
  const formatPercent = (val) => {
    return val ? `${(Number(val) * 100).toFixed(2)}%` : "-";
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">

      {/* ENCABEZADO Y RESUMEN DEL CRÉDITO */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">Resumen de Simulación</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
            {plan.moneda === 'USD' ? 'Dólares Americanos' : 'Soles'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          {/* Columna 1: Valores del Inmueble */}
          <div>
            <h3 className="font-semibold text-gray-500 mb-2">Datos del Inmueble</h3>
            <div className="flex justify-between py-1 border-b">
              <span>Precio Venta:</span>
              <span className="font-medium">{formatMoney(plan.precio_venta)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Cuota Inicial:</span>
              <span className="font-medium text-red-600">-{formatMoney(plan.cuota_inicial)}</span>
            </div>
            <div className="flex justify-between py-1 border-b bg-green-50">
              <span>Bono Techo Propio:</span>
              <span className="font-bold text-green-700">
                {Number(plan.bono_aplicable) > 0 ? `-${formatMoney(plan.bono_aplicable)}` : "No aplica"}
              </span>
            </div>
            <div className="flex justify-between py-1 mt-2 text-lg font-bold text-blue-900">
              <span>Monto a Financiar:</span>
              <span>{formatMoney(plan.monto_prestamo)}</span>
            </div>
          </div>

          {/* Columna 2: Condiciones del Préstamo */}
          <div>
            <h3 className="font-semibold text-gray-500 mb-2">Condiciones</h3>
            <div className="flex justify-between py-1 border-b">
              <span>Plazo:</span>
              <span className="font-medium">{plan.num_anios} años ({plan.total_cuotas} cuotas)</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Frecuencia:</span>
              <span className="font-medium capitalize">{plan.frecuencia_pago}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Tipo de Gracia:</span>
              <span className="font-medium capitalize">{plan.tipo_gracia}</span>
            </div>
            {plan.meses_gracia > 0 && (
              <div className="flex justify-between py-1 border-b">
                <span>Meses de Gracia:</span>
                <span className="font-medium">{plan.meses_gracia} meses</span>
              </div>
            )}
          </div>

          {/* Columna 3: Indicadores Financieros (TCEA/VAN/TIR) */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-gray-700 mb-2 text-center">Indicadores de Rentabilidad</h3>

            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">TCEA (Costo Real):</span>
              <span className="text-xl font-bold text-purple-700">{formatPercent(indicadores.tcea)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>TIR (Tasa Interna):</span>
              <span>{formatPercent(indicadores.tir)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>VAN (Valor Actual):</span>
              <span>{formatMoney(indicadores.van)}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
              <div className="flex justify-between">
                <span>Desembolso Neto (Cliente):</span>
                <span className="font-bold">{formatMoney(flujoInicial)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Link to="/">
            <Button>Elegir Otra Entidad Financiera</Button>
          </Link>
          <Link to="/simulador">
            <Button>Nueva Simulación</Button>
          </Link>
        </div>
      </div>

      {/* 2. TABLA DETALLADA DE PAGOS */}
      <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Cronograma de Pagos Detallado</h3>

        <div className="overflow-x-auto max-h-[600px] shadow-inner border rounded-lg">
          <table className="min-w-full text-xs text-right divide-y divide-gray-200">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 text-center">#</th>
                <th className="p-3">Saldo Inicial</th>
                <th className="p-3">Amortización</th>
                <th className="p-3">Interés</th>
                <th className="p-3 bg-yellow-50">Seg. Desgrav</th>
                <th className="p-3 bg-yellow-50">Seg. Riesgo</th>
                <th className="p-3 bg-yellow-50">Gastos/Comis.</th>
                <th className="p-3 bg-blue-50 text-blue-800 font-bold border-l border-blue-100">Cuota Total</th>
                <th className="p-3">Saldo Final</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {cuotas?.map((c) => (
                <tr key={c.numero} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-center font-medium text-gray-500">{c.numero}</td>
                  <td className="p-3">{formatMoney(c.saldo_inicial)}</td>
                  <td className="p-3 font-semibold text-green-600">{formatMoney(c.amortizacion)}</td>
                  <td className="p-3 text-red-600">{formatMoney(c.interes)}</td>

                  {/* Costos Adicionales (Importante para Transparencia) */}
                  <td className="p-3 bg-yellow-50 text-gray-600">{formatMoney(c.seguro_desgravamen)}</td>
                  <td className="p-3 bg-yellow-50 text-gray-600">{formatMoney(c.seguro_riesgo)}</td>
                  <td className="p-3 bg-yellow-50 text-gray-600">
                    {formatMoney(Number(c.comision) + Number(c.portes) + Number(c.gastos_administrativos))}
                  </td>

                  <td className="p-3 bg-blue-50 text-blue-800 font-bold border-l border-blue-100">
                    {formatMoney(Math.abs(c.flujo))} {/* Usamos el flujo negativo absoluto como cuota total a pagar */}
                  </td>

                  <td className="p-3 text-gray-400">{formatMoney(c.saldo_final)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}