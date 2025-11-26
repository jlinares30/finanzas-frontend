import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Socioeconomico from "../pages/Socioeconomico";
import Home from "../pages/Home";
import Simulador from "../pages/Simulador";
import Resultado from "../pages/Resultado";
import LocalList from "../pages/LocalList";
import DetalleLocal from "../pages/DetalleLocal";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/socioeconomico"
            element={
              <ProtectedRoute>
                <Socioeconomico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entidad/:entidadId/locales"
            element={
              <ProtectedRoute>
                <LocalList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entidad/:entidadId/local/:localId"
            element={
              <ProtectedRoute>
                <DetalleLocal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulador"
            element={
              <ProtectedRoute>
                <Simulador />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resultado"
            element={
              <ProtectedRoute>
                <Resultado />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
