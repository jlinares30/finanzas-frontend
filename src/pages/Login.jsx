import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { postLogin } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async () => {
    try {
      const resp = await postLogin(form);
      const data = resp.data;

      // El backend debe devolver un token si todo está bien
      if (!data.token) {
        alert(data.message || "Credenciales incorrectas");
        return;
      }
      console.log("Login exitoso:", data);
      login(data.token, data.user);

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-center">Iniciar Sesión</h2>

        <Input label="Email" name="email" value={form.email} onChange={update} />
        <Input label="Password" type="password" name="password" value={form.password} onChange={update} />

        <Button className="mt-4 w-full" onClick={onSubmit}>
          Entrar
        </Button>

        <p className="text-sm mt-3 text-center">
          ¿No tienes cuenta? <a className="text-blue-600" href="/register">Regístrate</a>
        </p>
      </Card>
    </div>
  );
}