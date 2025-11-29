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

    // LÓGICA DE FILTRADO Y ORDENAMIENTO ORIGINAL
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando...</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 min-h-screen bg-gray-50/50">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Elige una Entidad Financiera</h2>
                    {local && <p className="text-gray-600 mt-1">Para el local: <span className="font-semibold text-green-700">{local.nombre}</span></p>}
                </div>
                <Profile />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entidadesFiltradas.map((entidad) => {
                    const recommended = isRecommended(entidad);
                    
                    return (
                        <Card
                            key={entidad.id}
                            className={`transition-all duration-300 hover:shadow-xl border relative ${
                                recommended 
                                ? 'border-green-400 bg-green-50/30' 
                                : 'border-gray-200 bg-white'
                            }`}
                        >
                            {recommended && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                                    Recomendado
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${recommended ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    🏦
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">{entidad.nombre}</h3>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">Tasa ({entidad.tipo_tasa === "EFECTIVA" ? "TEA" : "TNA"}):</span>
                                    <span className="font-bold text-lg text-gray-800">{formatPercent(entidad.tasa_interes)}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <span className={`text-xs px-2 py-1 rounded border font-semibold ${entidad.moneda === 'PEN' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                        {entidad.moneda === 'PEN' ? 'Soles' : 'Dólares'}
                                    </span>
                                    {entidad.aplica_bono_techo_propio && (
                                        <span className="text-xs px-2 py-1 rounded border font-semibold bg-blue-50 text-blue-700 border-blue-200">
                                            Bono Techo Propio
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                className={`w-full py-3 ${recommended ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}
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