import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '50px 0', maxWidth: '760px' }}>
        <h1 style={{ marginBottom: '30px' }}>Your Cart</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link href="/" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <div className="cart-line" key={`${item.product_id}-${item.size}`}>
                <div style={{ width: '70px', height: '70px', background: '#efe9da', flexShrink: 0 }}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500 }}>{item.name}</p>
                  {item.size && <p style={{ fontSize: '.8rem', color: '#8a8371' }}>Size: {item.size}</p>}
                  <p style={{ fontSize: '.85rem', color: '#9c7c3d' }}>Rs {item.price.toLocaleString()}</p>
                </div>
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}>+</button>
                </div>
                <p style={{ width: '90px', textAlign: 'right', fontWeight: 500 }}>
                  Rs {(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  onClick={() => removeFromCart(item.product_id, item.size)}
                  style={{ background: 'none', border: 'none', color: '#a12626', cursor: 'pointer', fontSize: '.85rem' }}
                >
                  Remove
                </button>
              </div>
            ))}

            <div style={{ marginTop: '20px' }}>
              <div className="summary-row total">
                <span>Subtotal</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '.8rem', color: '#8a8371', marginTop: '6px' }}>
                Delivery charges calculated at checkout.
              </p>
            </div>

            <Link href="/checkout" className="btn btn-block" style={{ marginTop: '26px', textAlign: 'center', padding: '16px' }}>
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
                  }
