import { useState, useEffect } from "react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { crearPlanPago } from "../api/planPago.api";
import { useNavigate } from "react-router-dom";
import { getEntidadById } from "../api/entidadFinanciera.api";

export default function Simulador() {
  const navigate = useNavigate();
  const entidadFinancieraIdUrl = JSON.parse(localStorage.getItem("entidadFinancieraId"));
  const localIdUrl = JSON.parse(localStorage.getItem("localId"));
  const user = JSON.parse(localStorage.getItem("user"));
  const [entidadFinanciera, setEntidadFinanciera] = useState({});

  const [form, setForm] = useState({
    localId: localIdUrl,
    userId: user.id,
    entidadFinancieraId: entidadFinancieraIdUrl,
    precio_venta: "",
    cuota_inicial: "",
    bono_aplicable: "",
    num_anios: "",
    frecuencia_pago: "mensual",
    tipo_tasa: "EFECTIVA",
    tasa_interes_anual: "",
    capitalizacion: "",
    riodo_gracia_tipo: "SIN_GRACIA",
    odo_gracia_meses: 0
  });

  useEffect(() => {
    getEntidadById(entidadFinancieraIdUrl).then(r => setEntidadFinanciera(r.data));
  }, []);

  console.log(entidadFinanciera);
  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const simulate = async () => {
    const payload = {
      localId: Number(form.localId),
      userId: Number(form.userId),
      entidadFinancieraId: Number(form.entidadFinancieraId),
      precio_venta: Number(form.precio_venta),
      cuota_inicial: Number(form.cuota_inicial),
      bono_aplicable: Number(form.bono_aplicable),
      num_anios: Number(form.num_anios),
      frecuencia_pago: form.frecuencia_pago,
      tipo_tasa: form.tipo_tasa,
      tasa_interes_anual: Number(form.tasa_interes_anual),
      capitalizacion: form.capitalizacion ? Number(form.capitalizacion) : null,
      periodo_gracia: {
        tipo: form.periodo_gracia_tipo,
        meses: Number(form.periodo_gracia_meses)
      }
    };

    const resp = await crearPlanPago(payload);
    navigate("/resultado", { state: resp.data });
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Simulador de Crédito</h2>

      <div className="flex flex-col gap-3">

        <Input label="Precio Venta" name="precio_venta" value={form.precio_venta} onChange={update} />

        <Input label="Cuota Inicial" name="cuota_inicial" value={form.cuota_inicial} onChange={update} />

        <Input label="Bono Aplicable" name="bono_aplicable" value={form.bono_aplicable} onChange={update} />

        <Input label="Años del Crédito" name="num_anios" value={form.num_anios} onChange={update} />

        <Select label="Frecuencia de Pago" name="frecuencia_pago" value={form.frecuencia_pago} onChange={update}>
          <option value="mensual">Mensual</option>
          <option value="bimestral">Bimestral</option>
          <option value="trimestral">Trimestral</option>
        </Select>

        <Select label="Tipo de Tasa" name="tipo_tasa" value={form.tipo_tasa} onChange={update}>
          <option value="EFECTIVA">Efectiva</option>
          <option value="NOMINAL">Nominal</option>
        </Select>

        <Input label="Tasa Interés Anual" name="tasa_interes_anual" value={form.tasa_interes_anual} onChange={update} />

        <Input
          label="Capitalización (solo si es nominal)"
          name="capitalizacion"
          value={form.capitalizacion}
          onChange={update}
          disabled={form.tipo_tasa === "EFECTIVA"}
        />

        <Select label="Periodo de Gracia" name="periodo_gracia_tipo" value={form.periodo_gracia_tipo} onChange={update}>
          <option value="SIN_GRACIA">Sin Gracia</option>
          <option value="PARCIAL">Parcial</option>
          <option value="TOTAL">Total</option>
        </Select>

        <Input label="Meses de Gracia" name="periodo_gracia_meses" value={form.periodo_gracia_meses} onChange={update} />

        <Button onClick={simulate}>Simular</Button>
      </div>
    </Card>
  );
}
