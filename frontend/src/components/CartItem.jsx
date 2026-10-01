import { formatINR } from '../utils/money';

export default function CartItem({ item, onUpdate, onRemove, busy }) {
  return (
    <article className="cart-item">
      <div className="cart-thumb">{item.image ? <img src={item.image} alt="" /> : null}</div>
      <div>
        <h3>{item.name}</h3>
        <p>
          {item.color} / {item.size}
        </p>
        <div className="qty">
          <button type="button" disabled={busy || item.quantity <= 1} onClick={() => onUpdate(item._id, item.quantity - 1)}>
            −
          </button>
          <span>{item.quantity}</span>
          <button
            type="button"
            disabled={busy || (item.stock && item.quantity >= item.stock)}
            onClick={() => onUpdate(item._id, item.quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
      <div className="cart-item-side">
        <strong>{formatINR(item.price * item.quantity)}</strong>
        <button type="button" className="text-btn" onClick={() => onRemove(item._id)} disabled={busy}>
          Remove
        </button>
      </div>
    </article>
  );
}
