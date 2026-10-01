import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import SizeChart from '../components/SizeChart';
import { useCart } from '../context/CartContext';
import { chartForCategory } from '../data/sizeCharts';
import { api, errorMessage } from '../services/api';
import { formatINR } from '../utils/money';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [image, setImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showChart, setShowChart] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProduct(null);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        const next = res.data.product;
        setProduct(next);
        setColor(next.variants[0]?.color || '');
        setSize('');
        setImage(0);
      })
      .catch((err) => setError(errorMessage(err, 'Product not found')));
  }, [slug]);

  const colors = useMemo(() => [...new Set(product?.variants.map((variant) => variant.color) || [])], [product]);
  const sizes = useMemo(
    () => product?.variants.filter((variant) => variant.color === color) || [],
    [product, color]
  );
  const selected = sizes.find((variant) => variant.size === size);

  async function add(goCheckout) {
    if (!size) {
      setError('Select a size');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await addItem({
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        size,
        color,
        price: product.sellingPrice,
        quantity,
        sku: selected?.sku,
      });
      if (goCheckout) navigate('/checkout');
      else setNotice('Added to cart');
    } catch (err) {
      setError(errorMessage(err, 'Could not add to cart'));
    } finally {
      setBusy(false);
    }
  }

  if (error && !product) return <p className="empty">{error}</p>;
  if (!product) return <Loader />;

  const chart = chartForCategory(product.category?.slug);

  return (
    <div className="pdp">
      <div className="gallery">
        <img src={product.images[image]} alt={product.name} />
        <div className="thumbs">
          {product.images.map((src, index) => (
            <button type="button" key={src} className={index === image ? 'active' : ''} onClick={() => setImage(index)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="pdp-info">
        <p className="eyebrow">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="price">
          <span>{formatINR(product.sellingPrice)}</span>
          {product.discountPrice && product.discountPrice < product.price && <s>{formatINR(product.price)}</s>}
        </p>
        <p>{product.description}</p>
        <div className="choice">
          <span>Color</span>
          <div className="choice-row">
            {colors.map((item) => (
              <button
                type="button"
                key={item}
                className={item === color ? 'active' : ''}
                onClick={() => {
                  setColor(item);
                  setSize('');
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="choice">
          <span>Select size</span>
          <div className="choice-row">
            {sizes.map((variant) => (
              <button
                type="button"
                key={variant.size}
                disabled={variant.stock <= 0}
                className={variant.size === size ? 'active' : ''}
                onClick={() => setSize(variant.size)}
              >
                {variant.size}
              </button>
            ))}
          </div>
          <button type="button" className="text-btn" onClick={() => setShowChart((value) => !value)}>
            Size chart
          </button>
        </div>
        {showChart && <SizeChart chart={chart} />}
        <div className="qty">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => value + 1)} disabled={selected && quantity >= selected.stock}>+</button>
        </div>
        {selected && <p className="muted">{selected.stock} in stock</p>}
        {error && <p className="form-error">{error}</p>}
        {notice && <p className="form-ok">{notice}</p>}
        <div className="pdp-actions">
          <button type="button" className="btn" disabled={busy} onClick={() => add(false)}>
            Add to cart
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => add(true)}>
            Buy now
          </button>
        </div>
        <dl className="facts">
          <div><dt>Fit</dt><dd>{product.fit}</dd></div>
          <div><dt>Fabric</dt><dd>{product.fabric}</dd></div>
          <div><dt>Care</dt><dd>{product.careInstructions}</dd></div>
        </dl>
        <p className="muted">
          Cash on delivery at checkout. <Link to="/shipping">Shipping</Link> and <Link to="/returns">returns</Link>.
        </p>
      </div>
    </div>
  );
}
