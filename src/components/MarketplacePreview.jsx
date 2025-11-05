import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

const initialItems = [
  { id: 1, title: 'Organic Wheat (500 kg)', price: 18, unit: '₹/kg', location: 'Sitapur', type: 'Sell' },
  { id: 2, title: 'Need: Certified Paddy Seeds (50 kg)', price: 42, unit: '₹/kg', location: 'Nashik', type: 'Buy' },
  { id: 3, title: 'Tractor (sharing, hourly)', price: 700, unit: '₹/hour', location: 'Hassan', type: 'Rent' },
];

export default function MarketplacePreview() {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Sell');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('₹/kg');

  const addItem = (e) => {
    e.preventDefault();
    if (!title || !price || !location) return;
    const newItem = {
      id: Date.now(),
      title,
      price: Number(price),
      unit,
      location,
      type,
    };
    setItems([newItem, ...items]);
    setTitle('');
    setPrice('');
    setLocation('');
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
        <button className="bg-violet-600 text-white rounded-lg px-4 py-2 hover:bg-violet-700 transition md:col-span-3">List item</button>
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
      </div>
    </div>
  );
}
