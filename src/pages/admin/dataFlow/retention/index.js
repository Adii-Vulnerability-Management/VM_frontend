import { useEffect, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";

export default function RetentionPoliciesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", period: "", policyRef: "" });

  const fetchItems = async () => {
    const res = await CustomAxios.get(`${baseurl}/${initURL}/dataflow/retention`);
    setItems(res.data || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const createItem = async () => {
    await CustomAxios.post(`${baseurl}/${initURL}/dataflow/retention`, form);
    setForm({ name: "", period: "", policyRef: "" });
    fetchItems();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Retention Policies</h1>
      <div className="mb-4 space-x-2">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Period (e.g., 7y, 2y6m, 0)" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
        <input placeholder="Policy Ref" value={form.policyRef} onChange={e => setForm({ ...form, policyRef: e.target.value })} />
        <button onClick={createItem} className="bg-blue-500 text-white px-2">Add</button>
      </div>
      <ul className="list-disc pl-6">
        {items.map(it => (
          <li key={it._id}>{it.name} — {it.period} ({it.policyRef})</li>
        ))}
      </ul>
    </div>
  );
}
