import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { postLogin } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";
import { useConfirmation } from "../context/ConfirmationContext";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { alert } = useConfirmation();
  const [form, setForm] = useState({ email: "", password: "" });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async () => {
    try {
      const resp = await postLogin(form);
      const data = resp.data;

      // El backend debe devolver un token si todo está bien
      if (!data.token) {
        alert(data.message || "Credenciales incorrectas", "Error", "error");
        return;
      }
      console.log("Login exitoso:", data);
      login(data.token, data.user);

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor", "Error", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h2>
          <p className="text-gray-600">Ingresa a tu portal financiero</p>
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={update}
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={update}
        />

        <Button className="mt-6 w-full text-base py-3" onClick={onSubmit}>
          Iniciar Sesión
        </Button>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <a className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors" href="/register">
              Regístrate aquí
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}