import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { postRegister } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    birthdate: "",
    age: "",
    dni: ""
  });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async () => {
    const resp = await postRegister(form);
    const data = resp.data;

    if (!data.success) {
      alert("Error al registrar");
      return;
    }
    console.log("Registro exitoso:", data);
    login(resp.data.token, resp.data.user);

    navigate("/socioeconomico");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[450px]">
        <h2 className="text-xl font-bold mb-4 text-center">Crear Cuenta</h2>

        <Input label="Nombre" name="name" value={form.name} onChange={update} />
        <Input label="Email" name="email" value={form.email} onChange={update} />
        <Input label="Password" type="password" name="password" value={form.password} onChange={update} />
        <Input label="DNI" name="dni" value={form.dni} onChange={update} />
        <Input label="Género" name="gender" value={form.gender} onChange={update} />
        <Input label="Edad" name="age" value={form.age} onChange={update} />
        <Input label="Fecha de nacimiento" type="date" name="birthdate" value={form.birthdate} onChange={update} />

        <Button className="mt-4 w-full" onClick={onSubmit}>
          Registrar
        </Button>

        <p className="text-sm mt-3 text-center">
          ¿Ya tienes cuenta? <a className="text-blue-600" href="/login">Inicia Sesión</a>
        </p>
      </Card>
    </div>
  );
}
