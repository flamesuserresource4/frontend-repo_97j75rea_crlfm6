import { useMemo, useState } from 'react';
import { Droplets, CloudSun } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

function computeIrrigation({ soilType, moisture, forecast, area, cropStage }) {
  const baseBySoil = { Sandy: 35, Loam: 25, Clay: 18 };
  let mm = baseBySoil[soilType] || 25;
  if (moisureToNum(moisture) >= 70) mm -= 10;
  else if (moisureToNum(moisture) <= 30) mm += 10;
  if (forecast === 'Rainy') mm -= 8;
  if (forecast === 'Dry') mm += 6;
  const stageMods = { Seeding: 0.8, Vegetative: 1.0, Flowering: 1.2, Maturity: 0.6 };
  mm = Math.max(8, Math.round(mm * (stageMods[cropStage] || 1.0)));
  const litersPerHa = mm * 10000;
  const totalLiters = Math.round(litersPerHa * (Number(area) || 1));
  let interval = 4;
  if (moisureToNum(moisture) < 30 || forecast === 'Dry') interval = 2;
  if (moisureToNum(moisture) > 70 || forecast === 'Rainy') interval = 6;
  return { mm, litersPerHa, totalLiters, interval };
}

function moisureToNum(val) {
  const n = Number(val);
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

export default function IrrigationAdvisor() {
  const [soilType, setSoilType] = useState('Loam');
  const [moisture, setMoisture] = useState(45);
  const [forecast, setForecast] = useState('Normal');
  const [area, setArea] = useState(1);
  const [cropStage, setCropStage] = useState('Vegetative');
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(false);

  const local = useMemo(
    () => computeIrrigation({ soilType, moisture, forecast, area, cropStage }),
    [soilType, moisture, forecast, area, cropStage]
  );

  const getServerAdvice = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('soil_type', soilType);
      form.append('moisture', String(moisture));
      form.append('forecast', forecast);
      form.append('area', String(area));
      form.append('crop_stage', cropStage);
      const res = await fetch(`${API}/irrigation_advice`, { method: 'POST', body: form });
      const data = await res.json();
      setServer(data);
    } catch (e) {
      console.error(e);
      setServer(null);
      alert('Failed to fetch advisory from server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-white shadow"><Droplets className="w-5 h-5 text-emerald-600" /></div>
        <h3 className="text-xl font-semibold text-gray-900">Smart Irrigation Advisory</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Soil type</label>
          <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
            <option>Sandy</option>
            <option>Loam</option>
            <option>Clay</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Soil moisture (%)</label>
          <input type="number" min="0" max="100" value={moisture} onChange={(e) => setMoisture(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Weather forecast</label>
          <div className="flex items-center gap-3">
            <CloudSun className="w-5 h-5 text-sky-600" />
            <select value={forecast} onChange={(e) => setForecast(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option>Dry</option>
              <option>Normal</option>
              <option>Rainy</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Land area (hectares)</label>
          <input type="number" min="0.1" step="0.1" value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Crop stage</label>
          <select value={cropStage} onChange={(e) => setCropStage(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
            <option>Seeding</option>
            <option>Vegetative</option>
            <option>Flowering</option>
            <option>Maturity</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={getServerAdvice} className="bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 transition" disabled={loading}>
          {loading ? 'Getting advice…' : 'Get server advice'}
        </button>
        <span className="text-sm text-gray-500">Local preview updates instantly; server advice refines it.</span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Local estimate</p>
          <p className="text-3xl font-bold text-emerald-700">{local.mm} mm</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border"><p className="text-gray-500">Liters/ha</p><p className="font-semibold">{local.litersPerHa.toLocaleString()}</p></div>
            <div className="bg-white rounded-lg p-3 border"><p className="text-gray-500">Total liters</p><p className="font-semibold">{local.totalLiters.toLocaleString()}</p></div>
            <div className="bg-white rounded-lg p-3 border"><p className="text-gray-500">Interval</p><p className="font-semibold">Every {local.interval} days</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">Server advice</p>
          <p className="text-3xl font-bold text-sky-700">{server ? `${server.depth_mm} mm` : '—'}</p>
          {server && (
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border"><p className="text-gray-500">Liters/ha</p><p className="font-semibold">{server.liters_per_ha.toLocaleString()}</p></div>
              <div className="bg-white rounded-lg p-3 border"><p className="text-gray-500">Total liters</p><p className="font-semibold">{server.total_liters.toLocaleString()}</p></div>
              <div className="bg-white rounded-lg p-3 border"><p className="text-gray-500">Interval</p><p className="font-semibold">Every {server.interval_days} days</p></div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">Connect sensors for automatic scheduling and closed-loop control.</p>
    </div>
  );
}
