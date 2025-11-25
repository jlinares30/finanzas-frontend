import { useLocation, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Resultado() {
  const { state } = useLocation();
  const { message, plan, cuotas, indicadores, flujoInicial } = state;

  return (
    <div className="flex flex-col gap-6">

      <Card>
        <h2 className="text-xl font-bold mb-2">Resultado</h2>
        <p className="text-sm mb-3">{message}</p>

        <h3 className="font-semibold mt-4">Plan General</h3>
        <pre className="bg-gray-200 p-3 rounded text-xs overflow-auto">
          {JSON.stringify(plan, null, 2)}
        </pre>

        <h3 className="font-semibold mt-4">Indicadores Financieros</h3>
        <pre className="bg-gray-200 p-3 rounded text-xs overflow-auto">
          {JSON.stringify(indicadores, null, 2)}
        </pre>

        <h3 className="font-semibold mt-4">Flujo inicial</h3>
        <p className="text-sm">{flujoInicial}</p>

        <Link to="/simulador">
          <Button className="mt-4">Nueva Simulación</Button>
        </Link>
      </Card>

      <Card>
        <h3 className="text-lg font-bold mb-2">Cuotas</h3>

        <div className="overflow-auto max-h-[600px] text-xs">
          <table className="min-w-full border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border p-1">#</th>
                <th className="border p-1">Saldo Inicial</th>
                <th className="border p-1">Interés</th>
                <th className="border p-1">Cuota</th>
                <th className="border p-1">Amortización</th>
                <th className="border p-1">Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              {cuotas?.map((c) => (
                <tr key={c.numero}>
                  <td className="border p-1">{c.numero}</td>
                  <td className="border p-1">{c.saldo_inicial}</td>
                  <td className="border p-1">{c.interes}</td>
                  <td className="border p-1">{c.cuota}</td>
                  <td className="border p-1">{c.amortizacion}</td>
                  <td className="border p-1">{c.saldo_final}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
