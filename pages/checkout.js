import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ABC-${Date.now().toString().slice(-6)}${rand}`;
}

export default function Checkout() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (paymentMethod !== 'cod' && !screenshot) {
      setError('Please upload your payment screenshot.');
      return;
    }

    setSubmitting(true);
    try {
      let screenshotUrl = null;

      if (paymentMethod !== 'cod' && screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, screenshot);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);
        screenshotUrl = urlData.publicUrl;
      }

      const newOrderNumber = generateOrderNumber();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: newOrderNumber,
          customer_name: form.customer_name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          payment_method: paymentMethod,
          payment_screenshot_url: screenshotUrl,
          payment_status: 'pending',
          subtotal,
          notes: form.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderNumber(newOrderNumber);
      clearCart();
    } catch (err) {
      console.error(err);
      setError('Something went wrong placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '80px 0', textAlign: 'center', maxWidth: '520px' }}>
          <h1>Thank You!</h1>
          <p style={{ marginTop: '16px' }}>
            Your order <strong>{orderNumber}</strong> has been placed.
          </p>
          <p style={{ marginTop: '10px', color: '#5b564c' }}>
            We'll call you on the number provided to confirm your order before dispatch.
          </p>
          <button className="btn" style={{ marginTop: '30px' }} onClick={() => router.push('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '50px 0', maxWidth: '600px' }}>
        <h1 style={{ marginBottom: '30px' }}>Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Full Name</label>
            <input name="customer_name" required value={form.customer_name} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Phone Number</label>
            <input name="phone" required value={form.phone} onChange={handleChange} placeholder="03XX-XXXXXXX" />
          </div>
          <div className="form-field">
            <label>Delivery Address</label>
            <textarea name="address" required value={form.address} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>City</label>
            <input name="city" required value={form.city} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Order Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cod">Cash on Delivery</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
            </select>
          </div>

          {paymentMethod !== 'cod' && (
            <div style={{ background: '#faf8f2', border: '1px solid #eee6d6', padding: '18px', marginBottom: '18px' }}>
              <p style={{ fontSize: '.85rem', marginBottom: '10px' }}>
                Please transfer <strong>Rs {subtotal.toLocaleString()}</strong> to:
              </p>
              <p style={{ fontSize: '.85rem', color: '#5b564c' }}>
                {paymentMethod === 'bank_transfer' && 'Bank: [Your Bank] · Account Title: AB Collection · Account No: [Your Account Number]'}
                {paymentMethod === 'jazzcash' && 'JazzCash Number: +92 320 566 0555 · Account Title: AB Collection'}
                {paymentMethod === 'easypaisa' && 'EasyPaisa Number: +92 320 566 0555 · Account Title: AB Collection'}
              </p>
              <div className="form-field" style={{ marginTop: '14px' }}>
                <label>Upload Payment Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setScreenshot(e.target.files[0])}
                />
              </div>
            </div>
          )}

          <div style={{ margin: '20px 0' }}>
            <div className="summary-row total">
              <span>Total</span>
              <span>Rs {subtotal.toLocaleString()}</span>
            </div>
          </div>

          {error && <p style={{ color: '#a12626', marginBottom: '16px' }}>{error}</p>}

          <button type="submit" className="btn btn-block" disabled={submitting} style={{ padding: '16px' }}>
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
            }
