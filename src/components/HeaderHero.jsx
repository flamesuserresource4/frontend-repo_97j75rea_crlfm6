import { Sprout } from 'lucide-react';

export default function HeaderHero() {
  return (
    <div className="text-center space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm">
        <Sprout className="w-4 h-4" /> AgriSense AI
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Capture. Analyze. Act.</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">Use your camera for disease, weed, and soil analysis, and get an upgraded voice assistant for hands-free guidance.</p>
    </div>
  );
}
