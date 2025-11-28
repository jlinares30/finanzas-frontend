import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Profile from "../components/ui/Profile";
import { getAllPlanPagosByUserId, deletePlanPago } from "../api/planPago.api";
import { useAuthStore } from "../store/useAuthStore";
import { formatDate, formatMoney } from "../utils/format";

export default function HistoryPage() {
    const [planPagos, setPlanPagos] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.id) {
            loadPlans();
        }
    }, [user]);

    const loadPlans = async () => {
        try {
            const res = await getAllPlanPagosByUserId(user.id);
            console.log(res.data);
            const sortedPlans = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPlanPagos(sortedPlans);
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    const handleDelete = async (planId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este plan de pagos? Esta acción no se puede deshacer.")) {
            try {
                await deletePlanPago(planId);
                setPlanPagos(planPagos.filter(p => p.id !== planId));
            } catch (error) {
                console.error("Error eliminando plan:", error);
                alert("Hubo un error al eliminar el plan.");
            }
        }
    };

    const handleViewDetails = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Historial de Simulaciones</h1>
                <Profile />
            </div>

            {planPagos.length === 0 ? (
                <Card className="text-center p-8">
                    <p className="text-gray-500">No tienes simulaciones guardadas.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {planPagos.map((plan) => (
                        <Card key={plan.id} className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-blue-700">{plan.EntidadFinanciera?.nombre}</h3>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        {formatDate(plan.createdAt)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-gray-700 mb-1">{plan.Local?.nombre}</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Monto: {formatMoney(plan.monto_prestamo, plan.moneda)}
                                </p>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    onClick={() => handleViewDetails(plan)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                                >
                                    Ver Detalle
                                </Button>
                                <Button
                                    onClick={() => handleDelete(plan.id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-xs"
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal de Detalles */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Detalle de la Simulación"
            >
                {selectedPlan && (
                    <div className="space-y-6">
                        {/* Resumen Principal */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Cuota Mensual</p>
                                    <p className="text-xl font-bold text-blue-800">
                                        {formatMoney(selectedPlan.cuota_fija, selectedPlan.moneda)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total Intereses</p>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {formatMoney(selectedPlan.total_intereses, selectedPlan.moneda)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detalles del Préstamo */}
                        <div>
                            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Datos del Préstamo</h4>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <p><span className="font-semibold">Monto Préstamo:</span> {formatMoney(selectedPlan.monto_prestamo, selectedPlan.moneda)}</p>
                                <p><span className="font-semibold">Cuota Inicial:</span> {formatMoney(selectedPlan.cuota_inicial, selectedPlan.moneda)}</p>
                                <p><span className="font-semibold">Plazo:</span> {selectedPlan.num_anios} años ({selectedPlan.total_cuotas} cuotas)</p>
                                <p><span className="font-semibold">Frecuencia:</span> {selectedPlan.frecuencia_pago}</p>
                                <p><span className="font-semibold">Tasa Interés:</span> {(parseFloat(selectedPlan.EntidadFinanciera?.tasa_interes) * 100).toFixed(2)}% ({selectedPlan.EntidadFinanciera?.tipo_tasa})</p>
                                <p><span className="font-semibold">Periodo Gracia:</span> {selectedPlan.tipo_gracia} ({selectedPlan.meses_gracia} meses)</p>
                            </div>
                        </div>

                        {/* Detalles del Inmueble */}
                        <div>
                            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Inmueble</h4>
                            <div className="text-sm">
                                <p className="font-semibold">{selectedPlan.Local?.nombre}</p>
                                <p className="text-gray-600">{selectedPlan.Local?.direccion}</p>
                                <p className="mt-1"><span className="font-semibold">Precio Venta:</span> {formatMoney(selectedPlan.precio_venta, selectedPlan.moneda)}</p>
                            </div>
                        </div>

                        {/* Detalles de la Entidad */}
                        <div>
                            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Entidad Financiera</h4>
                            <div className="text-sm">
                                <p className="font-semibold">{selectedPlan.EntidadFinanciera?.nombre}</p>
                                <p>Bono Techo Propio: {selectedPlan.EntidadFinanciera?.aplica_bono_techo_propio ? "Sí" : "No"}</p>
                                <p>Seguro Desgravamen: {selectedPlan.EntidadFinanciera?.aplica_seguro_desgravamen ? "Sí" : "No"}</p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 pt-4 border-t text-center">
                            Simulación creada el: {formatDate(selectedPlan.createdAt)}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
