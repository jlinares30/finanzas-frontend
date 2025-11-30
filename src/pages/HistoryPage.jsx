import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Profile from "../components/ui/Profile";
import { getAllPlanPagosByUserId, deletePlanPago } from "../api/planPago.api";
import { useAuthStore } from "../store/useAuthStore";
import { formatDate, formatMoney } from "../utils/format";
import { useConfirmation } from "../context/ConfirmationContext";

export default function HistoryPage() {
    const [planPagos, setPlanPagos] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const { confirm, alert } = useConfirmation();

    useEffect(() => {
        if (user?.id) {
            loadPlans();
        }
    }, [user]);

    const loadPlans = async () => {
        try {
            const res = await getAllPlanPagosByUserId(user.id);
            const sortedPlans = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPlanPagos(sortedPlans);
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    const handleDelete = async (planId) => {
        const isConfirmed = await confirm({
            title: "Eliminar Simulación",
            message: "¿Estás seguro de que deseas eliminar este plan de pagos? Esta acción no se puede deshacer.",
            type: "warning",
            confirmText: "Eliminar",
            cancelText: "Cancelar"
        });

        if (isConfirmed) {
            try {
                await deletePlanPago(planId);
                setPlanPagos(planPagos.filter(p => p.id !== planId));
            } catch (error) {
                console.error("Error eliminando plan:", error);
                alert("Hubo un error al eliminar el plan.", "Error", "error");
            }
        }
    };

    const handleViewDetails = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Historial de Simulaciones</h1>
                    <p className="text-lg text-gray-600">Consulta y gestiona tus planes guardados</p>
                </div>
                <Profile />
            </div>

            {planPagos.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="text-6xl mb-4">📂</div>
                    <p className="text-xl text-gray-500 font-medium">No tienes simulaciones guardadas aún.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {planPagos.map((plan) => (
                        <Card
                            key={plan.id}
                            className="flex flex-col justify-between h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-600 group"
                        >
                            <div className="p-2">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                        {plan.EntidadFinanciera?.nombre}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {formatDate(plan.createdAt)}
                                    </span>
                                </div>

                                <h4 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
                                    {plan.Local?.nombre}
                                </h4>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-1">{plan.Local?.direccion}</p>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Monto del Préstamo</p>
                                    <p className="text-lg font-bold text-gray-800">{formatMoney(plan.monto_prestamo, plan.moneda)}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
                                <Button
                                    onClick={() => handleViewDetails(plan)}
                                    className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700"
                                >
                                    Ver Detalle
                                </Button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="px-4 py-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Detalle de la Simulación"
            >
                {selectedPlan && (
                    <div className="space-y-6">
                        {/* Header Resumen (Diseño Moderno) */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Cuota Mensual</p>
                                <p className="text-3xl font-extrabold text-blue-900">
                                    {formatMoney(selectedPlan.cuota_fija, selectedPlan.moneda)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Intereses</p>
                                <p className="text-xl font-bold text-gray-700">
                                    {formatMoney(selectedPlan.total_intereses, selectedPlan.moneda)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Columna 1: Datos del Préstamo (Todos los campos originales) */}
                            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm h-full">
                                <h4 className="font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                                    <span>🏦</span> Datos del Préstamo
                                </h4>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li className="flex justify-between">
                                        <span>Monto Préstamo:</span>
                                        <span className="font-semibold text-gray-800">{formatMoney(selectedPlan.monto_prestamo, selectedPlan.moneda)}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Cuota Inicial:</span>
                                        <span className="font-semibold text-gray-800">{formatMoney(selectedPlan.cuota_inicial, selectedPlan.moneda)}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Plazo:</span>
                                        <span className="font-semibold text-gray-800">{selectedPlan.num_anios} años ({selectedPlan.total_cuotas} cuotas)</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Frecuencia:</span>
                                        <span className="font-semibold text-gray-800 capitalize">{selectedPlan.frecuencia_pago}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Tasa Interés:</span>
                                        <span className="font-semibold text-gray-800">
                                            {(parseFloat(selectedPlan.EntidadFinanciera?.tasa_interes) * 100).toFixed(2)}% ({selectedPlan.EntidadFinanciera?.tipo_tasa})
                                        </span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Periodo Gracia:</span>
                                        <span className="font-semibold text-gray-800 text-right">
                                            {selectedPlan.tipo_gracia !== "SIN_GRACIA"
                                                ? (selectedPlan.tipo_gracia === "TOTAL" ? "Total" : "Parcial")
                                                : "Sin Gracia"}
                                            <span className="block text-xs font-normal text-gray-500">({selectedPlan.meses_gracia} meses)</span>
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Columna 2: Inmueble y Entidad (Todos los campos originales) */}
                            <div className="flex flex-col gap-6 h-full">
                                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex-1">
                                    <h4 className="font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                                        <span>🏢</span> Inmueble
                                    </h4>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <div>
                                            <p className="font-bold text-gray-800 text-base">{selectedPlan.Local?.nombre}</p>
                                            <p className="text-xs text-gray-500">{selectedPlan.Local?.direccion}</p>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-100">
                                            <span>Precio Venta:</span>
                                            <span className="font-semibold text-gray-800">{formatMoney(selectedPlan.precio_venta, selectedPlan.moneda)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex-1">
                                    <h4 className="font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
                                        <span>💼</span> Entidad Financiera
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex justify-between">
                                            <span className="font-semibold text-gray-800">{selectedPlan.EntidadFinanciera?.nombre}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Bono Techo Propio:</span>
                                            <span className={`font-semibold ${selectedPlan.EntidadFinanciera?.aplica_bono_techo_propio ? "text-green-600" : "text-gray-500"}`}>
                                                {selectedPlan.EntidadFinanciera?.aplica_bono_techo_propio ? "Sí" : "No"}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Seguro Desgravamen:</span>
                                            <span className="font-semibold text-gray-800">
                                                {selectedPlan.EntidadFinanciera?.aplica_seguro_desgravamen ? "Sí" : "No"}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
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