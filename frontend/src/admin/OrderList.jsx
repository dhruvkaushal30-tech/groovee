import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { formatINR } from '../utils/money';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function OrderList() {
  const [status, setStatus] = useState('Pending');
  const [orders, setOrders] = useState(null);

  function load(next = status) {
    const query = next ? `?status=${encodeURIComponent(next)}` : '';
    api.get(`/admin/orders${query}`).then((res) => setOrders(res.data.orders));
  }

  useEffect(() => {
    load('Pending');
  }, []);

  async function update(id, orderStatus) {
    await api.patch(`/admin/orders/${id}`, { orderStatus });
    load();
  }

  if (!orders) return <Loader />;

  return (
    <div>
      <div className="section-head">
        <h1>Orders</h1>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              load(e.target.value);
            }}
          >
            <option value="">All</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderNumber}</td>
              <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : order.address?.email}</td>
              <td>{formatINR(order.total)}</td>
              <td>{order.paymentMethod} · {order.paymentStatus}</td>
              <td>
                <select value={order.orderStatus} onChange={(e) => update(order._id, e.target.value)}>
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && <p className="empty">No orders in this view.</p>}
    </div>
  );
}
