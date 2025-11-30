import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEntidades } from "../api/entidadFinanciera.api";
import { getLocalById } from "../api/locales.api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Profile from "../components/ui/Profile";
import Modal from "../components/ui/Modal";
import { useSimulationStore } from "../store/useSimulationStore";
import { formatPercent } from "../utils/format";

export default function EntidadList() {
    const { localId } = useParams();
    const navigate = useNavigate();
    const setSimulationData = useSimulationStore((state) => state.setSimulationData);

    const [entidades, setEntidades] = useState([]);
    const [local, setLocal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedEntidad, setSelectedEntidad] = useState(null);

    console.log(entidades);
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                {entidadesFiltradas.map((entidad) => {
                    const recommended = isRecommended(entidad);

                    return (
                        <div
                            key={entidad.id}
                            className={`transition-all p-6 duration-300 hover:shadow-xl border-2 relative ${recommended
                                ? 'border-green-500 bg-green-100 shadow-md transform scale-[1.02]'
                                : 'border-gray-200 bg-blue-50'
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

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setSelectedEntidad(entidad)}
                                >
                                    Ver Detalle
                                </Button>
                                <Button
                                    className={`flex-1 py-3 ${recommended ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                                    onClick={() => seleccionarEntidad(entidad.id)}
                                >
                                    Simular
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>


            <Modal
                isOpen={!!selectedEntidad}
                onClose={() => setSelectedEntidad(null)}
                title={selectedEntidad?.nombre || "Detalle de Entidad"}
            >
                {selectedEntidad && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Moneda" value={selectedEntidad.moneda} />
                            <DetailItem label="Tasa de Interés" value={formatPercent(selectedEntidad.tasa_interes)} />
                            <DetailItem label="Tipo de Tasa" value={selectedEntidad.tipo_tasa} />
                            <DetailItem label="Frecuencia Nominal" value={selectedEntidad.frecuencia_nominal} />
                            <DetailItem label="Frecuencia Efectiva" value={selectedEntidad.frecuencia_efectiva} />
                            <DetailItem label="Capitalización" value={selectedEntidad.capitalizacion} />
                            <DetailItem label="Seguro Desgravamen" value={formatPercent(selectedEntidad.seguro_desgravamen)} />
                            <DetailItem label="Aplica Seguro Desgravamen" value={selectedEntidad.aplica_seguro_desgravamen} isBoolean />
                            <DetailItem label="Aplica Bono Techo Propio" value={selectedEntidad.aplica_bono_techo_propio} isBoolean />
                            <DetailItem label="Máx. Meses de Gracia" value={selectedEntidad.max_meses_gracia} />
                            <DetailItem label="Periodos de Gracia Permitidos" value={selectedEntidad.periodos_gracia_permitidos} />
                            {/* <DetailItem label="Activo" value={selectedEntidad.activo} isBoolean /> */}

                        </div>
                    </div>
                )}
            </Modal>
        </div >
    );
}

function DetailItem({ label, value, isBoolean = false }) {
    let displayValue = value;

    if (value === null || value === undefined) {
        displayValue = <span className="text-gray-400 italic">N/A</span>;
    } else if (isBoolean) {
        displayValue = value ? (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Sí</span>
        ) : (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">No</span>
        );
    }

    return (
        <div className="border-b border-gray-100 pb-2">
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <div className="text-gray-900 font-semibold mt-1">{displayValue}</div>
        </div>
    );
}