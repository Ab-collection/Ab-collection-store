import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['All', 'Dresses', 'Abayas', 'Pret', 'Accessories'];

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeCategory = router.query.category || 'All';

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    setProducts(data || []);
    setLoading(false);
  }

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div>
      <Navbar />

      <section
        style={{
          background: '#0b0b0d',
          color: '#f7f4ee',
          padding: '80px 0',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <p style={{ letterSpacing: '.3em', fontSize: '.75rem', color: '#c6a15b', textTransform: 'uppercase' }}>
            AB Collection
          </p>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', marginTop: '14px' }}>
            Style That <em style={{ color: '#e9d6a6' }}>Defines</em> You
          </h1>
        </div>
      </section>

      <div className="container">
        <div className="category-filter">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? 'active' : ''}
              onClick={() =>
                router.push(cat === 'All' ? '/' : `/?category=${cat}`)
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ padding: '60px 0' }}>Loading products…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No products found in this category yet.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <div className="product-card" key={product.id}>
                <Link href={`/product/${product.id}`}>
                  <div className="product-thumb">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} />
                    )}
                  </div>
                </Link>
                <div className="product-info">
                  <p style={{ fontSize: '.7rem', color: '#9c7c3d', textTransform: 'uppercase' }}>
                    {product.category}
                  </p>
                  <h3>
                    <Link href={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p>
                    <span className="price">Rs {product.price.toLocaleString()}</span>
                    {product.compare_at_price && (
                      <span className="compare-price">
                        Rs {product.compare_at_price.toLocaleString()}
                      </span>
                    )}
                  </p>
                  <button
                    className="btn btn-block"
                    style={{ marginTop: '14px' }}
                    onClick={() => addToCart(product, 1)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: '#0b0b0d', color: '#c9c6bf', padding: '40px 0', marginTop: '60px', textAlign: 'center', fontSize: '.85rem' }}>
        <div className="container">
          &copy; 2026 AB Collection · ABcollection.pk · +92 320 566 0555
        </div>
      </footer>
    </div>
  );
                }
