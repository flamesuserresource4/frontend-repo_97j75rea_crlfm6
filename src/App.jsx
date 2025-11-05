import CameraDetector from './components/CameraDetector.jsx';
import SoilClassifier from './components/SoilClassifier.jsx';
import VoiceAssistant from './components/VoiceAssistant.jsx';
import HeaderHero from './components/HeaderHero.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-gray-900">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <HeaderHero />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <CameraDetector />
        <SoilClassifier />
        <VoiceAssistant />

        <footer className="pt-4 text-center text-gray-500 text-sm">
          Camera-powered analysis and a smarter voice assistant connected to the server.
        </footer>
      </main>
    </div>
  );
}
