import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { supabase } from '../../lib/supabaseClient';

const EMPTY_FORM = {
  name: '',
  category: 'Dresses',
  price: '',
  compare_at_price: '',
  description: '',
  stock: '',
};

export default function AdminProducts() {
  const { session, loading } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) fetchProducts();
  }, [session]);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setProducts(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      compare_at_price: product.compare_at_price || '',
      description: product.description || '',
      stock: product.stock,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }

      const payload = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        description: form.description,
        stock: parseInt(form.stock, 10) || 0,
        ...(image_url ? { image_url } : {}),
      };

      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId);
      } else {
        await supabase.from('products').insert(payload);
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to save product.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    fetchProducts();
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product permanently?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  if (loading || !session) return <div style={{ padding: '40px' }}>Loading…</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Products</h1>
        <Link href="/admin" className="btn btn-outline">Back to Orders</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#faf8f2', padding: '24px', marginTop: '30px', maxWidth: '520px' }}>
        <h3 style={{ marginBottom: '16px' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>

        <div className="form-field">
          <label>Name</label>
          <input name="name" required value={form.name} onChange={handleChange} />
        </div>

        <div className="form-field">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option>Dresses</option>
            <option>Abayas</option>
            <option>Pret</option>
            <option>Accessories</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Price (Rs)</label>
            <input type="number" name="price" required value={form.price} onChange={handleChange} />
          </div>
          <div className="form-field" style={{ flex: 1 }}>
            <label>Compare-at Price (optional)</label>
            <input type="number" name="compare_at_price" value={form.compare_at_price} onChange={handleChange} />
          </div>
        </div>

        <div className="form-field">
          <label>Stock Quantity</label>
          <input type="number" name="stock" required value={form.stock} onChange={handleChange} />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-field">
          <label>Product Image {editingId ? '(leave blank to keep current)' : ''}</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>Rs {product.price.toLocaleString()}</td>
              <td>{product.stock}</td>
              <td>
                <button className="btn btn-outline" onClick={() => toggleActive(product)}>
                  {product.is_active ? 'Active' : 'Hidden'}
                </button>
              </td>
              <td style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline" onClick={() => startEdit(product)}>Edit</button>
                <button className="btn btn-outline" style={{ color: '#a12626', borderColor: '#a12626' }} onClick={() => deleteProduct(product.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
