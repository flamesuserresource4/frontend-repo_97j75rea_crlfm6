import { useMemo, useState } from 'react';
import { Droplets, CloudSun } from 'lucide-react';

function computeIrrigation({ soilType, moisture, forecast, area, cropStage }) {
  // Simple rule-based advisory (no network calls). Values are illustrative.
  const baseBySoil = { Sandy: 35, Loam: 25, Clay: 18 }; // mm per irrigation
  let mm = baseBySoil[soilType] || 25;

  // Adjust by current moisture
  if (moisureToNum(moisture) >= 70) mm -= 10;
  else if (moisureToNum(moisture) <= 30) mm += 10;

  // Adjust by forecast
  if (forecast === 'Rainy') mm -= 8;
  if (forecast === 'Dry') mm += 6;

  // Crop stage modifier
  const stageMods = { Seeding: 0.8, Vegetative: 1.0, Flowering: 1.2, Maturity: 0.6 };
  mm = Math.max(8, Math.round(mm * (stageMods[cropStage] || 1.0)));

  // Convert to liters per hectare (1 mm = 10,000 L/ha)
  const litersPerHa = mm * 10000;
  const totalLiters = Math.round(litersPerHa * (Number(area) || 1));

  // Suggested interval in days
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

  const result = useMemo(
    () => computeIrrigation({ soilType, moisture, forecast, area, cropStage }),
    [soilType, moisture, forecast, area, cropStage]
  );

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

      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800">Recommended irrigation depth</p>
        <p className="text-3xl font-bold text-emerald-700">{result.mm} mm</p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-gray-500">Liters/ha</p>
            <p className="font-semibold">{result.litersPerHa.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-gray-500">Total liters</p>
            <p className="font-semibold">{result.totalLiters.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-gray-500">Interval</p>
            <p className="font-semibold">Every {result.interval} days</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-gray-500">Next step</p>
            <p className="font-semibold">Irrigate in {result.interval} days</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">This is a rule-based illustration. Sensor/IoT data can further refine advice and enable auto-control.</p>
    </div>
  );
}
