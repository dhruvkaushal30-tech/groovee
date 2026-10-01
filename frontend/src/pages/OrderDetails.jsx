import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { api, errorMessage } from '../services/api';
import { formatINR } from '../utils/money';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data.order)).catch((err) => setError(errorMessage(err)));
  }, [id]);

  async function cancel() {
    const res = await api.patch(`/orders/${id}/cancel`);
    setOrder(res.data.order);
  }

  if (error) return <p className="empty">{error}</p>;
  if (!order) return <Loader />;

  const canCancel = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed';

  return (
    <div className="page-narrow wide">
      <p className="eyebrow">Order confirmed</p>
      <h1>{order.orderNumber}</h1>
      <p className="status">{order.orderStatus}</p>
      <p className="muted">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
      <div className="order-list">
        {order.items.map((item) => (
          <div key={item.sku} className="order-row">
            <strong>{item.name}</strong>
            <span>{item.color} / {item.size}</span>
            <span>× {item.quantity}</span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <p>Ship to {order.address.firstName} {order.address.lastName}, {order.address.address}, {order.address.city} {order.address.pincode}</p>
      <p className="total-line">Total {formatINR(order.total)}</p>
      {canCancel && (
        <button type="button" className="btn btn-ghost" onClick={cancel}>Cancel order</button>
      )}
      <p><Link to="/orders">All orders</Link></p>
    </div>
  );
}
