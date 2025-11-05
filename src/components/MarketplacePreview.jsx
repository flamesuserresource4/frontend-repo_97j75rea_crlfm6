import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function MarketplacePreview() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Sell');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('₹/kg');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/marketplace`);
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!title || !price || !location) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('price', price);
      form.append('unit', unit);
      form.append('type', type);
      form.append('location', location);
      const res = await fetch(`${API}/marketplace`, { method: 'POST', body: form });
      const data = await res.json();
      const created = data.item || {
        id: Date.now(),
        title,
        price: Number(price),
        unit,
        location,
        type,
      };
      setItems([created, ...items]);
      setTitle('');
      setPrice('');
      setLocation('');
    } catch (e) {
      console.error(e);
      alert('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-white shadow"><ShoppingCart className="w-5 h-5 text-violet-600" /></div>
        <h3 className="text-xl font-semibold text-gray-900">Farmer-to-Farmer Marketplace</h3>
      </div>

      <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Item title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded-lg border border-gray-300 px-3 py-2" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <select className="rounded-lg border border-gray-300 px-3 py-2" value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option>₹/kg</option>
          <option>₹/quintal</option>
          <option>₹/hour</option>
          <option>₹/unit</option>
        </select>
        <select className="rounded-lg border border-gray-300 px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option>Sell</option>
          <option>Buy</option>
          <option>Rent</option>
        </select>
        <input className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <button className="bg-violet-600 text-white rounded-lg px-4 py-2 hover:bg-violet-700 transition md:col-span-3" disabled={loading}>{loading ? 'Listing…' : 'List item'}</button>
      </form>

      <div className="divide-y">
        {items.map((it) => (
          <div key={it.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{it.title}</p>
              <p className="text-sm text-gray-600">{it.type} • {it.location}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹ {it.price} <span className="text-gray-500 text-sm">{it.unit}</span></p>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-6 text-center text-gray-500">No listings yet. Be the first to add one!</p>
        )}
      </div>
    </div>
  );
}
