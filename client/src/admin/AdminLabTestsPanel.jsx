import React, { useEffect, useState } from 'react';
import { Plus, Pencil, EyeOff } from 'lucide-react';
import { createLabTest, deleteLabTest, getAdminLabTests, updateLabTest } from '../utils/api';

const emptyForm = {
  name: '',
  category: 'Hematology',
  price: '',
  report_time: '24',
  description: '',
  img: '',
  sort_order: '0',
};

const AdminLabTestsPanel = ({ t }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getAdminLabTests();
      if (resp.data?.success) setTests(resp.data.tests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (test) => {
    setEditId(test.id);
    setForm({
      name: test.name || '',
      category: test.category || 'General',
      price: String(test.price ?? ''),
      report_time: String(test.report_time ?? 24),
      description: test.description || '',
      img: test.img || '',
      sort_order: String(test.sort_order ?? 0),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        report_time: Number(form.report_time),
        description: form.description,
        img: form.img,
        sort_order: Number(form.sort_order),
        is_active: true,
      };
      if (editId && !String(editId).startsWith('cat_')) {
        await updateLabTest(editId, payload);
      } else if (!String(editId).startsWith('cat_')) {
        await createLabTest(payload);
      } else {
        await createLabTest(payload);
      }
      setForm(emptyForm);
      setEditId(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save. Ensure Supabase labtests table exists.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (String(id).startsWith('cat_')) {
      alert('Add tests to the database first (run supabase_setup.sql), then you can hide catalog items.');
      return;
    }
    if (!window.confirm('Hide this test from the public diagnostics page?')) return;
    await deleteLabTest(id);
    load();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">{t('diag.catalog.title')}</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">{t('diag.catalog.sub')}</p>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
          <input
            required
            placeholder="Test name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="pro-input md:col-span-2"
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="pro-input"
          />
          <input
            type="number"
            placeholder="Price ₹"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="pro-input"
          />
          <input
            type="number"
            placeholder="Report hours"
            value={form.report_time}
            onChange={(e) => setForm({ ...form, report_time: e.target.value })}
            className="pro-input"
          />
          <input
            type="number"
            placeholder="Sort order"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            className="pro-input"
          />
          <input
            placeholder="Image URL"
            value={form.img}
            onChange={(e) => setForm({ ...form, img: e.target.value })}
            className="pro-input md:col-span-2"
          />
          <textarea
            placeholder="Description / preparation"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="pro-textarea md:col-span-2"
            rows={2}
          />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="pro-btn-primary">
              <Plus size={16} className="inline mr-1" />
              {editId ? t('diag.catalog.save') : t('diag.catalog.add')}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm(emptyForm); }}
                className="pro-btn-outline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : tests.length === 0 ? (
          <p className="text-slate-400">{t('diag.catalog.empty')}</p>
        ) : (
          <div className="table-scroll rounded-xl border border-slate-200">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-100 text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="p-3 text-left">Test</th>
                  <th className="p-3">₹</th>
                  <th className="p-3">Hrs</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id || test.name} className="border-t border-slate-100">
                    <td className="p-3">
                      <div className="flex gap-3 items-center">
                        {test.img && (
                          <img src={test.img} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{test.name}</p>
                          <p className="text-xs text-slate-500">{test.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold">{test.price}</td>
                    <td className="p-3 text-center">{test.report_time}</td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => startEdit(test)} className="p-2 rounded-lg hover:bg-slate-100" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => handleDeactivate(test.id)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-700" title="Hide">
                          <EyeOff size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLabTestsPanel;
