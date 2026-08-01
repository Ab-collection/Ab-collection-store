import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link href="/" className="brand">
          AB <span>Collection</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/?category=Dresses">Dresses</Link></li>
          <li><Link href="/?category=Abayas">Abayas</Link></li>
          <li><Link href="/?category=Pret">Pret</Link></li>
          <li><Link href="/?category=Accessories">Accessories</Link></li>
        </ul>
        <Link href="/cart" className="btn btn-outline" style={{ borderColor: '#c6a15b', color: '#e9d6a6' }}>
          Cart <span className="cart-badge">{itemCount}</span>
        </Link>
      </div>
    </header>
  );
}
