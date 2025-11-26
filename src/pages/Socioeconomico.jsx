import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { postSocioeconomico } from "../api/auth.api";

export default function Socioeconomico() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));


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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[450px]">
        <h2 className="text-xl font-bold mb-4 text-center">Datos Socioeconómicos</h2>

        <Input label="Ocupación" name="ocupacion" value={form.ocupacion} onChange={update} />
        <Input label="Ingresos Mensuales" type="number" name="ingresos_mensuales" value={form.ingresos_mensuales} onChange={update} />
        <Input label="Tipo de Contrato" name="tipo_contrato" value={form.tipo_contrato} onChange={update} />
        <Input label="Nivel Educativo" name="nivel_educativo" value={form.nivel_educativo} onChange={update} />

        <Button className="mt-4 w-full" onClick={onSubmit}>
          Guardar Información
        </Button>
      </Card>
    </div>
  );
}
