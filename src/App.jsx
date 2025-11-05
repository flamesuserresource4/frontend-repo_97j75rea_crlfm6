import { useState } from 'react';
import AuthPanel from './components/AuthPanel.jsx';
import AIServiceGrid from './components/AIServiceGrid.jsx';
import IrrigationAdvisor from './components/IrrigationAdvisor.jsx';
import MarketplacePreview from './components/MarketplacePreview.jsx';
import { User } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-gray-900">
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AgriSense AI</h1>
            <p className="text-sm text-gray-600">AI advisory • Smart irrigation • Marketplace</p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center"><User className="w-5 h-5" /></div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.method === 'google' ? 'Google' : 'Phone OTP'}</p>
                </div>
                <button onClick={() => { setUser(null); setSelected(null); }} className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg">Logout</button>
              </div>
            ) : (
              <span className="text-sm text-gray-600">Not signed in</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {!user && (
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-semibold">Welcome, farmer! 🌾</h2>
              <p className="text-gray-600">Sign in to access soil analysis, disease detection, smart irrigation, and the farmer marketplace.</p>
            </div>
            <AuthPanel onLogin={setUser} />
          </section>
        )}

        {user && (
          <>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Choose a service</h2>
              <AIServiceGrid onSelect={setSelected} />
            </section>

            {selected === 'irrigation' && (
              <section>
                <IrrigationAdvisor />
              </section>
            )}

            {selected === 'marketplace' && (
              <section>
                <MarketplacePreview />
              </section>
            )}

            {selected && selected !== 'irrigation' && selected !== 'marketplace' && (
              <section className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-2">{labelFor(selected)}</h3>
                <p className="text-gray-600">This section will handle uploads and predictions. In a full build, these connect to the backend for soil classification, disease detection, forecasts, and the assistant. For now, explore Smart Irrigation and the Marketplace which are ready to try.</p>
              </section>
            )}
          </>
        )}

        <footer className="pt-8 text-center text-gray-500 text-sm">
          Connected experience: secure sign-in, live server advice, and marketplace listings backed by the API.
        </footer>
      </main>
    </div>
  );
}

function labelFor(key) {
  switch (key) {
    case 'soil':
      return 'Soil Classification';
    case 'crop':
      return 'Disease & Weed Detection';
    case 'assistant':
      return 'Voice/Text Assistant';
    case 'yield_price':
      return 'Yield & Price Forecasts';
    default:
      return 'Service';
  }
}
