import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('Invalid email or password.');
      return;
    }
    router.push('/admin');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0b0d' }}>
      <form
        onSubmit={handleLogin}
        style={{ background: '#fff', padding: '40px', width: '360px' }}
      >
        <h1 style={{ fontSize: '1.4rem', marginBottom: '24px', textAlign: 'center' }}>AB Collection Admin</h1>
        <div className="form-field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: '#a12626', marginBottom: '14px', fontSize: '.85rem' }}>{error}</p>}
        <button className="btn btn-block" disabled={loading} style={{ padding: '14px' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
