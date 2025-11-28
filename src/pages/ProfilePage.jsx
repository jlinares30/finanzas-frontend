import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { getProfile, updateProfile, updateSocioeconomico } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";

export default function ProfilePage() {
    const { user: authUser, login } = useAuthStore();
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
            alert("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            alert("Error al actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !userData.email) return <div className="p-6 text-center">Cargando perfil...</div>;

    return (
        <div className="p-6 flex justify-center">
            <Card className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Mi Perfil</h2>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)}>
                            Editar Perfil
                        </Button>
                    )}
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                        {userData.name?.charAt(0).toUpperCase()}
                    </div>
                    {!isEditing ? (
                        <>
                            <h2 className="text-xl font-bold">{userData.name}</h2>
                            <p className="text-gray-500">{userData.email}</p>
                        </>
                    ) : (
                        <div className="w-full max-w-sm space-y-2">
                            <Input label="Nombre" name="name" value={userData.name} onChange={handleChangeUser} />
                            <Input label="Email" name="email" value={userData.email} disabled />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Datos Personales */}
                    <div>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-blue-800">Datos Personales</h3>
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
                                    <div><span className="text-sm text-gray-500 block">DNI</span> <span className="font-medium">{userData.dni || "-"}</span></div>
                                    <div><span className="text-sm text-gray-500 block">Edad</span> <span className="font-medium">{userData.age || "-"}</span></div>
                                    <div><span className="text-sm text-gray-500 block">Género</span> <span className="font-medium">{userData.gender || "-"}</span></div>
                                    <div><span className="text-sm text-gray-500 block">Fecha Nacimiento</span> <span className="font-medium">{userData.birthdate || "-"}</span></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Datos Socioeconómicos */}
                    <div>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-green-800">Datos Socioeconómicos</h3>
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
                                    <div><span className="text-sm text-gray-500 block">Ocupación</span> <span className="font-medium">{socioData.ocupacion || "-"}</span></div>
                                    <div><span className="text-sm text-gray-500 block">Ingresos Mensuales</span> <span className="font-medium">S/ {socioData.ingresos_mensuales || "0.00"}</span></div>
                                    <div><span className="text-sm text-gray-500 block">Tipo Contrato</span> <span className="font-medium">{socioData.tipo_contrato || "-"}</span></div>
                                    <div><span className="text-sm text-gray-500 block">Nivel Educativo</span> <span className="font-medium">{socioData.nivel_educativo || "-"}</span></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 flex justify-end gap-2">
                        <Button className="bg-gray-500 hover:bg-gray-600" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Cambios</Button>
                    </div>
                )}

            </Card>
        </div>
    );
}
