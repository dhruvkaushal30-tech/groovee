import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { formatINR } from '../utils/money';

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.orders));
  }, []);

  if (!orders) return <Loader />;

  return (
    <div className="page-narrow wide">
      <h1>Orders</h1>
      {!orders.length && <p className="empty">You have not placed an order yet.</p>}
      <div className="order-list">
        {orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`} className="order-row">
            <strong>{order.orderNumber}</strong>
            <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
            <span>{formatINR(order.total)}</span>
            <span className="status">{order.orderStatus}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
