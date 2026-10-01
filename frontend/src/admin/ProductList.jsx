import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { api, errorMessage } from '../services/api';
import { formatINR } from '../utils/money';

export default function ProductList() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/products?includeInactive=true&limit=48').then((res) => setProducts(res.data.products));
  }

  useEffect(load, []);

  async function remove(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!products) return <Loader />;

  return (
    <div>
      <div className="section-head">
        <h1>Products</h1>
        <Link to="/admin/products/create" className="btn">Add product</Link>
      </div>
      {error && <p className="form-error">{error}</p>}
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{formatINR(product.sellingPrice)}</td>
              <td>{product.variants.reduce((sum, variant) => sum + variant.stock, 0)}</td>
              <td>{product.isActive ? 'Active' : 'Hidden'}</td>
              <td className="row-actions">
                <Link to={`/admin/products/${product._id}/edit`}>Edit</Link>
                <button type="button" className="text-btn" onClick={() => remove(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
