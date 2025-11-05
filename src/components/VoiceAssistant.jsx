import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Bot, Loader2, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AgriSense assistant. Ask me about irrigation, pests, market prices, or say "analyze my leaf photo" after you upload one in the detection section.' }
  ]);
  const [tts, setTts] = useState(true);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup Speech Recognition if available
    const AnyRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (AnyRecognition) {
      const recog = new AnyRecognition();
      recog.lang = 'en-US';
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' : '') + transcript);
      };
      recog.onend = () => setListening(false);
      recognitionRef.current = recog;
    }
  }, []);

  useEffect(() => {
    // Speak latest assistant message
    if (!tts) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(last.content);
      utter.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, [messages, tts]);

  const toggleListening = () => {
    const recog = recognitionRef.current;
    if (!recog) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (listening) {
      recog.stop();
      setListening(false);
    } else {
      try {
        setInput('');
        recog.start();
        setListening(true);
      } catch (e) {
        // ignore "already started" errors
      }
    }
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content) return;
    const newThread = [...messages, { role: 'user', content }];
    setMessages(newThread);
    setInput('');
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, thread: newThread.slice(-8) }),
      });
      if (!resp.ok) throw new Error('Server error');
      const data = await resp.json();
      const reply = data.reply || data.answer || JSON.stringify(data);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not reach the server. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Voice Assistant</h2>
        </div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" className="accent-emerald-600" checked={tts} onChange={(e) => setTts(e.target.checked)} />
          <span className="text-gray-700">Speak replies</span>
        </label>
      </div>

      <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white/70 space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 self-start' : 'bg-gray-900 text-white ml-auto'}`}>
            {m.role === 'assistant' && (
              <div className="flex items-center gap-1 mb-1 text-emerald-900/70 text-xs">
                <Sparkles className="w-3 h-3" /> Assistant
              </div>
            )}
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={toggleListening} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${listening ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-700'}`}>
          <Mic className={`w-4 h-4 ${listening ? 'text-emerald-600' : ''}`} /> {listening ? 'Listening...' : 'Voice' }
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Speak or type your question..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
        />
        <button onClick={sendMessage} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500">Tip: Ask for irrigation schedules, pest management, fertilizer recommendations, or market price insights.</p>
    </section>
  );
}
