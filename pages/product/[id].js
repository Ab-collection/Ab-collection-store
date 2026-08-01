import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabaseClient';
import { useCart } from '../../context/CartContext';

const SIZES = ['S', 'M', 'L', 'XL'];

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('M');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) console.error(error);
    setProduct(data);
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '60px 0' }}>Loading…</div>
      </div>
    );
  }

  const needsSize = product.category !== 'Accessories';

  function handleAdd() {
    addToCart(product, 1, needsSize ? size : null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '50px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
        <div className="product-thumb" style={{ height: '480px' }}>
          {product.image_url && <img src={product.image_url} alt={product.name} />}
        </div>
        <div>
          <p style={{ fontSize: '.75rem', color: '#9c7c3d', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            {product.category}
          </p>
          <h1 style={{ fontSize: '2rem', marginTop: '10px' }}>{product.name}</h1>
          <p style={{ marginTop: '16px', fontSize: '1.3rem', color: '#9c7c3d' }}>
            Rs {product.price.toLocaleString()}
            {product.compare_at_price && (
              <span className="compare-price" style={{ marginLeft: '12px' }}>
                Rs {product.compare_at_price.toLocaleString()}
              </span>
            )}
          </p>
          <p style={{ marginTop: '20px', color: '#5b564c' }}>{product.description}</p>

          {needsSize && (
            <div style={{ marginTop: '26px' }}>
              <p style={{ fontSize: '.8rem', marginBottom: '10px' }}>Select Size</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      width: '42px',
                      height: '42px',
                      border: size === s ? '2px solid #0b0b0d' : '1px solid #ddd4bd',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn"
            style={{ marginTop: '30px', width: '100%', padding: '16px' }}
            onClick={handleAdd}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>

          <p style={{ marginTop: '16px', fontSize: '.8rem', color: '#8a8371' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'} · COD, Bank Transfer & JazzCash accepted
          </p>
        </div>
      </div>
    </div>
  );
          }
