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

    const isRecommended = (entidad) => {
        return entidad.tasa_interes < 0.15 || entidad.periodos_gracia_permitidos === 'TOTAL' || entidad.periodos_gracia_permitidos === 'AMBOS';
    };

    if (loading) return <div className="p-6">Cargando...</div>;

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Elige una Entidad Financiera</h2>
                <Profile />
            </div>
            {local && <p className="mb-6 text-gray-600">Para el local: <strong>{local.nombre}</strong></p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {entidades.map((entidad) => {
                    const recommended = isRecommended(entidad);
                    return (
                        <Card
                            key={entidad.id}
                            className={`shadow-md transition-all ${recommended ? 'border-2 border-green-500 bg-green-50' : ''}`}
                        >
                            {recommended && (
                                <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full w-fit mb-2">
                                    Recomendado
                                </div>
                            )}

                            <h3 className="text-lg font-semibold">{entidad.nombre}</h3>
                            <p className="text-sm text-gray-600 mb-2">{entidad.descripcion}</p>

                            <div className="text-sm space-y-1">
                                <p className="text-sm">Tasa: {formatPercent(entidad.tasa_interes)} {entidad.tipo_tasa == "EFECTIVA" ? entidad.frecuencia_efectiva : entidad.frecuencia_nominal}</p>
                                <p className="text-sm">Tipo de Tasa: {entidad.tipo_tasa}</p>
                                <p className="text-sm">Moneda: {entidad.moneda}</p>
                                {entidad.capitalizacion && <p className="text-sm">Capitalización: {entidad.capitalizacion}</p>}
                                <p className="text-sm">Periodo de Gracia: {entidad.periodos_gracia_permitidos !== "SIN_GRACIA" ? "Aplica" : "No Aplica"}</p>
                                {entidad.periodos_gracia_permitidos !== "SIN_GRACIA" && <p className="text-sm">Gracia: Hasta {entidad.max_meses_gracia} meses</p>}
                                {entidad.periodos_gracia_permitidos !== "SIN_GRACIA" && <p className="text-sm">({entidad.periodos_gracia_permitidos})</p>}
                                <p className="text-sm">Bono Techo Propio: {entidad.aplica_bono_techo_propio === true ? "Aplica" : "No Aplica"}</p>
                            </div>

                            <Button
                                className={`mt-4 w-full ${recommended ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={() => seleccionarEntidad(entidad.id)}
                            >
                                Seleccionar
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
