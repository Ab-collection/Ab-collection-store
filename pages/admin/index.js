import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const { session, loading } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [orderItemsMap, setOrderItemsMap] = useState({});

  useEffect(() => {
    if (session) fetchOrders();
  }, [session]);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setOrders(data || []);
  }

  async function toggleExpand(orderId) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!orderItemsMap[orderId]) {
      const { data } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      setOrderItemsMap((prev) => ({ ...prev, [orderId]: data || [] }));
    }
  }

  async function updatePaymentStatus(orderId, status) {
    await supabase.from('orders').update({ payment_status: status }).eq('id', orderId);
    fetchOrders();
  }

  async function updateOrderStatus(orderId, status) {
    await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    fetchOrders();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading || !session) return <div style={{ padding: '40px' }}>Loading…</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Orders</h1>
        <div style={{ display: 'flex', gap: '14px' }}>
          <Link href="/admin/products" className="btn btn-outline">Manage Products</Link>
          <button className="btn btn-outline" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p style={{ marginTop: '30px' }}>No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>City</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <>
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.phone}</td>
                  <td>{order.city}</td>
                  <td>Rs {order.subtotal.toLocaleString()}</td>
                  <td>
                    <span className={`status-pill status-${order.payment_status}`}>
                      {order.payment_method.replace('_', ' ')} · {order.payment_status}
                    </span>
                  </td>
                  <td>{order.order_status}</td>
                  <td>
                    <button className="btn btn-outline" onClick={() => toggleExpand(order.id)}>
                      {expandedId === order.id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr>
                    <td colSpan={8} style={{ background: '#faf8f2' }}>
                      <div style={{ padding: '16px' }}>
                        <p><strong>Address:</strong> {order.address}</p>
                        {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}

                        <p style={{ marginTop: '10px' }}><strong>Items:</strong></p>
                        <ul>
                          {(orderItemsMap[order.id] || []).map((item) => (
                            <li key={item.id}>
                              {item.product_name} {item.size ? `(${item.size})` : ''} × {item.quantity} — Rs {item.price.toLocaleString()}
                            </li>
                          ))}
                        </ul>

                        {order.payment_screenshot_url && (
                          <div style={{ marginTop: '14px' }}>
                            <p><strong>Payment Screenshot:</strong></p>
                            <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer">
                              <img
                                src={order.payment_screenshot_url}
                                alt="Payment proof"
                                style={{ maxWidth: '260px', marginTop: '8px', border: '1px solid #ddd' }}
                              />
                            </a>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                          <div>
                            <p style={{ fontSize: '.8rem', marginBottom: '6px' }}>Payment Status</p>
                            <select
                              value={order.payment_status}
                              onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="verified">Verified</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div>
                            <p style={{ fontSize: '.8rem', marginBottom: '6px' }}>Order Status</p>
                            <select
                              value={order.order_status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="new">New</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
                  }
