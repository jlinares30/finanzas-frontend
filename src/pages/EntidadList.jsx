import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEntidades } from "../api/entidadFinanciera.api";
import { getLocalById } from "../api/locales.api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Profile from "../components/ui/Profile";
import { useSimulationStore } from "../store/useSimulationStore";
import { formatPercent } from "../utils/format";

export default function EntidadList() {
    const { localId } = useParams();
    const navigate = useNavigate();
    const setSimulationData = useSimulationStore((state) => state.setSimulationData);

    const [entidades, setEntidades] = useState([]);
    const [local, setLocal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entidadesRes, localRes] = await Promise.all([
                    getEntidades(),
                    getLocalById(localId)
                ]);

                setEntidades(entidadesRes.data || []);
                setLocal(localRes.data.local);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [localId]);

    const seleccionarEntidad = (entidadId) => {
        setSimulationData(entidadId, localId);
        navigate("/simulador");
    };

    // LÓGICA DE FILTRADO Y ORDENAMIENTO
    const entidadesFiltradas = entidades.filter(entidad => {
        if (!local) return true;

        return true;
    }).sort((a, b) => {
        const precioLocal = Number(local?.precio || 0);
        const esTechoPropio = precioLocal <= 128900;

        if (esTechoPropio) {

            if (a.aplica_bono_techo_propio && !b.aplica_bono_techo_propio) return -1;
            if (!a.aplica_bono_techo_propio && b.aplica_bono_techo_propio) return 1;
        }
        return Number(a.tasa_interes) - Number(b.tasa_interes);
    });

    const isRecommended = (entidad) => {
        return Number(entidad.tasa_interes) < 0.12;
    };

    if (loading) return <div className="p-6">Cargando...</div>;

    //Orden de prioridad 
    //Si el precio es menor a 128900 se ordena por entidad que aplica bono techo propio
    //tasa de interes menor a 12% 
    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Elige una Entidad Financiera</h2>
                <Profile />
            </div>
            {local && <p className="mb-6 text-gray-600">Para el local: <strong>{local.nombre}</strong></p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {entidadesFiltradas.map((entidad) => {
                    const recommended = isRecommended(entidad);

                    // Verificación visual de moneda
                    const mismaMoneda = local && local.moneda === entidad.moneda;

                    return (
                        <Card
                            key={entidad.id}
                            className={`shadow-md transition-all relative overflow-hidden ${recommended ? 'border-2 border-green-500 bg-green-50' : 'bg-white'}`}
                        >
                            {recommended && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    Mejor Tasa
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-gray-800 mt-2">{entidad.nombre}</h3>

                            {/* Tags informativos */}
                            <div className="flex gap-2 my-2 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded font-semibold ${entidad.moneda === 'PEN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {entidad.moneda === 'PEN' ? 'Soles' : 'Dólares'}
                                </span>
                                {!mismaMoneda && (
                                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800 font-semibold">
                                        Requiere Cambio
                                    </span>
                                )}
                                {entidad.aplica_bono_techo_propio && (
                                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                                        Acepta Bono
                                    </span>
                                )}
                            </div>

                            <div className="text-sm space-y-2 text-gray-600 mt-3">
                                <div className="flex justify-between border-b pb-1">
                                    <span>Tasa ({entidad.tipo_tasa === "EFECTIVA" ? "TEA" : "TNA"}):</span>
                                    <span className="font-bold text-gray-900">{formatPercent(entidad.tasa_interes)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <span>Gracia:</span>
                                    <span>{entidad.periodos_gracia_permitidos !== "SIN_GRACIA" ? `Hasta ${entidad.max_meses_gracia} meses` : "No"}</span>
                                </div>
                            </div>

                            <Button
                                className={`mt-4 w-full ${recommended ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                                onClick={() => seleccionarEntidad(entidad.id)}
                            >
                                Simular con {entidad.moneda}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
