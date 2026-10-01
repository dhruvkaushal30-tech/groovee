import { Link } from 'react-router-dom';
import { formatINR } from '../utils/money';

export default function ProductCard({ product }) {
  const soldOut = product.variants?.every((variant) => variant.stock <= 0);
  const price = product.sellingPrice ?? product.discountPrice ?? product.price;
  const showDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-media">
        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="ph" />}
        {soldOut && <span className="badge">Sold out</span>}
      </Link>
      <div className="product-card-body">
        <p className="eyebrow">{product.category?.name || product.brand}</p>
        <h3>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="price">
          <span>{formatINR(price)}</span>
          {showDiscount && <s>{formatINR(product.price)}</s>}
        </p>
      </div>
    </article>
  );
}
