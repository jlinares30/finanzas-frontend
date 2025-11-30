import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Profile from "../components/ui/Profile";
import { getProfile, updateProfile, updateSocioeconomico } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";
import { formatMoney } from "../utils/format";
import { useConfirmation } from "../context/ConfirmationContext";

export default function ProfilePage() {
    const { user: authUser, login } = useAuthStore();
    const { alert } = useConfirmation();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        dni: "",
        age: "",
        gender: "",
        birthdate: ""
    });

    const [socioData, setSocioData] = useState({
        ocupacion: "",
        ingresos_mensuales: "",
        tipo_contrato: "",
        nivel_educativo: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await getProfile(authUser.id);
            console.log(res.data.user.Socioeconomico);
            const { user } = res.data;
            const { Socioeconomico } = res.data.user;


            setUserData({
                name: user.name || "",
                email: user.email || "",
                dni: user.dni || "",
                age: user.age || "",
                gender: user.gender || "",
                birthdate: user.birthdate ? user.birthdate.split('T')[0] : ""
            });

            if (Socioeconomico) {
                setSocioData({
                    ocupacion: Socioeconomico.ocupacion || "",
                    ingresos_mensuales: Socioeconomico.ingresos_mensuales || "",
                    tipo_contrato: Socioeconomico.tipo_contrato || "",
                    nivel_educativo: Socioeconomico.nivel_educativo || ""
                });
            }
        } catch (error) {
            console.error("Error cargando perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeUser = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleChangeSocio = (e) => {
        setSocioData({ ...socioData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            await updateProfile({ ...userData, id: authUser.id });
            console.log(userData);
            await updateSocioeconomico({ ...socioData, id: authUser.id });

            login(useAuthStore.getState().token, { ...authUser, ...userData });
            setIsEditing(false);
            alert("Perfil actualizado correctamente", "Éxito", "success");
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            alert("Error al actualizar el perfil", "Error", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !userData.email) return <div className="p-8 text-center text-lg text-gray-600">Cargando perfil...</div>;

    return (
        <div className="p-8 flex justify-center">
            <Card className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Mi Perfil</h2>
                    <Profile />
                </div>

                <div className="flex flex-col items-center mb-10 pb-8 border-b border-gray-200">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
                        {userData.name?.charAt(0).toUpperCase()}
                    </div>
                    {!isEditing ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
                            <p className="text-gray-500 text-lg">{userData.email}</p>
                        </>
                    ) : (
                        <div className="w-full max-w-md space-y-2">
                            <Input label="Nombre" name="name" value={userData.name} onChange={handleChangeUser} />
                            <Input label="Email" name="email" value={userData.email} disabled />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Datos Personales */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="text-xl font-bold mb-6 text-blue-800 flex items-center gap-2">
                            <span>👤</span> Datos Personales
                        </h3>
                        <div className="space-y-4">
                            {isEditing ? (
                                <>
                                    <Input label="DNI" name="dni" value={userData.dni} onChange={handleChangeUser} />
                                    <Input label="Edad" name="age" type="number" value={userData.age} onChange={handleChangeUser} />
                                    <Input label="Género" name="gender" value={userData.gender} onChange={handleChangeUser} />
                                    <Input label="Fecha Nacimiento" name="birthdate" type="date" value={userData.birthdate} onChange={handleChangeUser} />
                                </>
                            ) : (
                                <>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">DNI</span> <span className="font-semibold text-gray-800">{userData.dni || "-"}</span></div>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">Edad</span> <span className="font-semibold text-gray-800">{userData.age || "-"}</span></div>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">Género</span> <span className="font-semibold text-gray-800">{userData.gender || "-"}</span></div>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">Fecha Nacimiento</span> <span className="font-semibold text-gray-800">{userData.birthdate || "-"}</span></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Datos Socioeconómicos */}
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                        <h3 className="text-xl font-bold mb-6 text-green-800 flex items-center gap-2">
                            <span>💼</span> Datos Socioeconómicos
                        </h3>
                        <div className="space-y-4">
                            {isEditing ? (
                                <>
                                    <Input label="Ocupación" name="ocupacion" value={socioData.ocupacion} onChange={handleChangeSocio} />
                                    <Input label="Ingresos Mensuales" name="ingresos_mensuales" type="number" value={socioData.ingresos_mensuales} onChange={handleChangeSocio} />
                                    <Input label="Tipo Contrato" name="tipo_contrato" value={socioData.tipo_contrato} onChange={handleChangeSocio} />
                                    <Input label="Nivel Educativo" name="nivel_educativo" value={socioData.nivel_educativo} onChange={handleChangeSocio} />
                                </>
                            ) : (
                                <>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">Ocupación</span> <span className="font-semibold text-gray-800">{socioData.ocupacion || "-"}</span></div>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">Ingresos Mensuales</span> <span className="font-semibold text-gray-800">{formatMoney(socioData.ingresos_mensuales)}</span></div>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">Tipo Contrato</span> <span className="font-semibold text-gray-800">{socioData.tipo_contrato || "-"}</span></div>
                                    <div className="bg-white p-3 rounded-lg"><span className="text-sm text-gray-600 block mb-1 font-medium">Nivel Educativo</span> <span className="font-semibold text-gray-800">{socioData.nivel_educativo || "-"}</span></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {!isEditing && (
                    <div className="mt-8 flex justify-end gap-3">
                        <Button onClick={() => setIsEditing(true)}>
                            Editar Perfil
                        </Button>
                    </div>
                )}

                {isEditing && (
                    <div className="mt-8 flex justify-end gap-3">
                        <Button className="bg-gray-500 hover:bg-gray-600" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Cambios</Button>
                    </div>
                )}

            </Card>
        </div>
    );
}