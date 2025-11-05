import { Image, Mic, ShoppingCart, Droplets, CloudSun } from 'lucide-react';

const cards = [
  {
    key: 'soil',
    title: 'Soil Classification',
    desc: 'Upload a soil photo to detect soil type and get fertilizer guidance.',
    icon: Image,
    color: 'from-amber-500 to-orange-500',
  },
  {
    key: 'crop',
    title: 'Disease & Weed Detection',
    desc: 'Identify crop diseases or weeds and get treatment suggestions.',
    icon: Image,
    color: 'from-rose-500 to-pink-500',
  },
  {
    key: 'assistant',
    title: 'Voice/Text Assistant',
    desc: 'Ask anything in your language. Get instant, simple answers.',
    icon: Mic,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    key: 'yield_price',
    title: 'Yield & Price Forecasts',
    desc: 'Predict yields and forecast market prices for smarter planning.',
    icon: CloudSun,
    color: 'from-sky-500 to-indigo-500',
  },
  {
    key: 'irrigation',
    title: 'Smart Irrigation',
    desc: 'Use soil type, moisture, and weather to plan irrigation.',
    icon: Droplets,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    key: 'marketplace',
    title: 'Farmer Marketplace',
    desc: 'Buy/sell crops, seeds, fertilizers, or tools with nearby farmers.',
    icon: ShoppingCart,
    color: 'from-violet-500 to-fuchsia-500',
  },
];

export default function AIServiceGrid({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map(({ key, title, desc, icon: Icon, color }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`group text-left bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-xl transition relative overflow-hidden`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
          <div className="relative flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white shadow-md">
              <Icon className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600 mt-1 text-sm">{desc}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
