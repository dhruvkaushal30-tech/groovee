import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { formatINR } from '../utils/money';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <Loader />;

  const cards = [
    ['Total users', data.stats.totalUsers],
    ['Total products', data.stats.totalProducts],
    ['Total orders', data.stats.totalOrders],
    ['Pending orders', data.stats.pendingOrders],
    ['Revenue', formatINR(data.stats.revenue)],
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {cards.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <h2>Recent orders</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.recentOrders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderNumber}</td>
              <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : '—'}</td>
              <td>{formatINR(order.total)}</td>
              <td>{order.orderStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
