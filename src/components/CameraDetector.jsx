import { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Send, Loader2, Leaf } from 'lucide-react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

export default function CameraDetector() {
  const [mode, setMode] = useState('disease'); // 'disease' | 'weed'
  const [streaming, setStreaming] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopStream();
    };
  }, [previewUrl]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch (e) {
      console.error('Camera error', e);
      alert('Unable to access camera. Please allow permission or use file upload.');
    }
  };

  const stopStream = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(t => t.stop());
      video.srcObject = null;
    }
    setStreaming(false);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopStream();
    }, 'image/jpeg', 0.92);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const submitForDetection = async () => {
    if (!previewUrl && !streaming) {
      alert('Capture a photo or upload an image first.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let blob;
      if (streaming) {
        // Ensure we capture the latest frame
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const w = video.videoWidth;
        const h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      } else if (previewUrl) {
        const r = await fetch(previewUrl);
        blob = await r.blob();
      }

      const form = new FormData();
      form.append('image', blob, 'capture.jpg');
      form.append('file', blob, 'capture.jpg'); // compatibility with backends expecting `file`
      form.append('mode', mode);

      const resp = await fetch(`${API_BASE}/detect_disease`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) throw new Error('Server error');
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Disease & Weed Detection</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setMode('disease')}
            className={`px-3 py-1.5 rounded-lg border ${mode==='disease' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200'}`}
          >Disease</button>
          <button
            onClick={() => setMode('weed')}
            className={`px-3 py-1.5 rounded-lg border ${mode==='weed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200'}`}
          >Weed</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-black/5 grid place-items-center relative">
            {!streaming && !previewUrl && (
              <p className="text-gray-500 text-sm">Camera preview will appear here</p>
            )}
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {previewUrl && !streaming && (
              <img src={previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!streaming ? (
              <button onClick={startStream} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white">
                <Camera className="w-4 h-4" /> Open Camera
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={captureFrame} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white">
                  <Camera className="w-4 h-4" /> Capture
                </button>
                <button onClick={stopStream} className="px-3 py-2 rounded-lg border border-gray-200 bg-white">Stop</button>
              </div>
            )}

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer">
              <ImageIcon className="w-4 h-4" />
              <span>Upload</span>
              <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </label>

            <button onClick={submitForDetection} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-700 text-white disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Analyze
            </button>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
          <h3 className="font-medium text-emerald-900 mb-3">Result</h3>
          {!result && <p className="text-sm text-emerald-900/80">Capture or upload an image and press Analyze. The server will detect {mode === 'disease' ? 'leaf disease' : 'weeds'}.</p>}
          {result && (
            <div className="space-y-2">
              {result.label && <p className="text-lg font-semibold">{result.label}</p>}
              {typeof result.confidence !== 'undefined' && (
                <p className="text-sm text-emerald-900/80">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
              )}
              {result.recommendation && (
                <div className="text-sm text-emerald-900/90">
                  <p className="font-medium">Recommendation</p>
                  <p>{result.recommendation}</p>
                </div>
              )}
              <pre className="text-xs bg-white/70 border border-emerald-200 rounded-lg p-3 overflow-auto"><code>{JSON.stringify(result, null, 2)}</code></pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
