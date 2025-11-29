import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { postSocioeconomico } from "../api/auth.api";

import { useAuthStore } from "../store/useAuthStore";

export default function Socioeconomico() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();


  const [form, setForm] = useState({
    ocupacion: "",
    ingresos_mensuales: 0,
    tipo_contrato: "",
    nivel_educativo: "",
  });

  // Actualiza el estado del formulario
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async () => {
    await postSocioeconomico({
      ...form,
      userId: user.id
    });
    console.log("Datos socioeconómicos guardados:", form);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <Card className="w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Datos Socioeconómicos</h2>
        <p className="text-gray-600 text-center mb-8">Completa tu perfil financiero</p>

        <Input label="Ocupación" name="ocupacion" value={form.ocupacion} onChange={update} />
        <Input label="Ingresos Mensuales" type="number" name="ingresos_mensuales" value={form.ingresos_mensuales} onChange={update} />
        <Input label="Tipo de Contrato" name="tipo_contrato" value={form.tipo_contrato} onChange={update} />
        <Input label="Nivel Educativo" name="nivel_educativo" value={form.nivel_educativo} onChange={update} />

        <Button className="mt-6 w-full py-3" onClick={onSubmit}>
          Guardar Información
        </Button>
      </Card>
    </div>
  );
}