import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { api, errorMessage } from '../services/api';

const emptyVariant = { size: 'M', color: 'Black', stock: 5, sku: '' };

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: 'Groove',
    fit: 'Oversized',
    fabric: '',
    careInstructions: 'Machine wash cold. Dry flat.',
    tags: '',
    isFeatured: false,
    isActive: true,
    variants: [{ ...emptyVariant }],
  });

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data.categories);
      if (!id) {
        setForm((current) => ({ ...current, category: res.data.categories[0]?._id || '' }));
      }
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then((res) => {
      const product = res.data.product;
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || '',
        category: product.category?._id || product.category,
        brand: product.brand,
        fit: product.fit,
        fabric: product.fabric,
        careInstructions: product.careInstructions,
        tags: (product.tags || []).join(', '),
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        variants: product.variants,
      });
      setExistingImages(product.images || []);
      setLoading(false);
    });
  }, [id]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setVariant(index, key, value) {
    setForm((current) => {
      const variants = current.variants.map((variant, i) => (i === index ? { ...variant, [key]: value } : variant));
      return { ...current, variants };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'variants') data.append('variants', JSON.stringify(value));
      else if (typeof value === 'boolean') data.append(key, String(value));
      else data.append(key, value);
    });
    data.append('existingImages', JSON.stringify(existingImages));
    [...files].forEach((file) => data.append('images', file));
    try {
      if (id) await api.patch(`/products/${id}`, data);
      else await api.post('/products', data);
      navigate('/admin/products');
    } catch (err) {
      setError(errorMessage(err, 'Could not save product'));
    }
  }

  if (loading) return <Loader />;

  return (
    <form className="stack-form admin-form" onSubmit={submit}>
      <h1>{id ? 'Edit product' : 'Add product'}</h1>
      <label>Name<input required value={form.name} onChange={(e) => setField('name', e.target.value)} /></label>
      <label>Description<textarea required rows="4" value={form.description} onChange={(e) => setField('description', e.target.value)} /></label>
      <div className="form-grid">
        <label>Price<input required type="number" min="0" value={form.price} onChange={(e) => setField('price', e.target.value)} /></label>
        <label>Discount price<input type="number" min="0" value={form.discountPrice} onChange={(e) => setField('discountPrice', e.target.value)} /></label>
        <label>
          Category
          <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>Brand<input value={form.brand} onChange={(e) => setField('brand', e.target.value)} /></label>
        <label>
          Fit
          <select value={form.fit} onChange={(e) => setField('fit', e.target.value)}>
            <option>Oversized</option>
            <option>Relaxed</option>
            <option>Regular</option>
          </select>
        </label>
        <label>Fabric<input value={form.fabric} onChange={(e) => setField('fabric', e.target.value)} /></label>
      </div>
      <label>Care<input value={form.careInstructions} onChange={(e) => setField('careInstructions', e.target.value)} /></label>
      <label>Tags<input value={form.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="hoodie, oversized" /></label>
      <label className="check"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} /> Featured</label>
      <label className="check"><input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} /> Active</label>
      <h2>Variants</h2>
      {form.variants.map((variant, index) => (
        <div className="variant-row" key={index}>
          <input value={variant.size} onChange={(e) => setVariant(index, 'size', e.target.value)} placeholder="Size" required />
          <input value={variant.color} onChange={(e) => setVariant(index, 'color', e.target.value)} placeholder="Color" required />
          <input type="number" min="0" value={variant.stock} onChange={(e) => setVariant(index, 'stock', Number(e.target.value))} placeholder="Stock" />
          <input value={variant.sku} onChange={(e) => setVariant(index, 'sku', e.target.value)} placeholder="SKU" />
          <button
            type="button"
            className="text-btn"
            onClick={() => setForm((current) => ({ ...current, variants: current.variants.filter((_, i) => i !== index) }))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" onClick={() => setForm((current) => ({ ...current, variants: [...current.variants, { ...emptyVariant }] }))}>
        Add variant
      </button>
      {!!existingImages.length && (
        <div className="thumbs">
          {existingImages.map((src) => (
            <button type="button" key={src} onClick={() => setExistingImages((current) => current.filter((item) => item !== src))}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
      <label>
        Images
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn" type="submit">Save product</button>
    </form>
  );
}
