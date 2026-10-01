import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import Loader from '../components/Loader';
import { api } from '../services/api';

const titles = {
  'new-in': 'Fresh Drop',
  hoodies: 'Oversized Hoodies',
  bottoms: 'Bottoms',
  't-shirts': 'Oversized T-shirts',
};

const sorts = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Best Selling' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = params.toString();

  useEffect(() => {
    let active = true;
    setLoading(true);
    const search = new URLSearchParams(params);
    if (!search.get('limit')) search.set('limit', '12');
    api
      .get(`/products?${search.toString()}`)
      .then((res) => {
        if (active) setData(res.data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  function update(next) {
    const copy = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) copy.delete(key);
      else copy.set(key, value);
    });
    if (!('page' in next)) copy.delete('page');
    setParams(copy);
  }

  const page = data?.page || 1;

  return (
    <div className="shop-page">
      <header className="page-intro">
        {titles[params.get('category')] ? <p className="eyebrow">{titles[params.get('category')]}</p> : null}
        {params.get('q') ? <h1>{`Results for “${params.get('q')}”`}</h1> : null}
      </header>
      <div className="shop-layout">
        <div>
          <div className="shop-toolbar">
            <button type="button" className="filter-toggle" onClick={() => setFiltersOpen((open) => !open)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
                <circle cx="8" cy="7" r="1.6" />
                <circle cx="15" cy="12" r="1.6" />
                <circle cx="10" cy="17" r="1.6" />
              </svg>
              Filter & Sort
            </button>
            <p>{data ? `${data.totalProducts} pieces` : ''}</p>
          </div>
          {loading ? <Loader /> : <ProductGrid products={data?.products || []} />}
          {data && data.totalPages > 1 && (
            <div className="pager">
              <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                Previous
              </button>
              {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((number) => (
                <button key={number} type="button" className={number === page ? 'active' : ''} onClick={() => update({ page: String(number) })}>
                  {number}
                </button>
              ))}
              <button type="button" disabled={page >= data.totalPages} onClick={() => update({ page: String(page + 1) })}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      {filtersOpen && (
        <div className="filter-backdrop" onClick={() => setFiltersOpen(false)}>
          <aside className="filters filter-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="section-head">
              <h2>Filter & Sort</h2>
              <button type="button" className="text-btn" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>
            <label>
              Sort by
              <select value={params.get('sort') || 'featured'} onChange={(e) => update({ sort: e.target.value })}>
                {sorts.map((sort) => (
                  <option key={sort.value} value={sort.value}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={params.get('category') || ''} onChange={(e) => update({ category: e.target.value })}>
                <option value="">All</option>
                <option value="new-in">New In</option>
                <option value="hoodies">Hoodies</option>
                <option value="t-shirts">T-Shirts</option>
                <option value="bottoms">Bottoms</option>
              </select>
            </label>
            <label>
              Size
              <select value={params.get('size') || ''} onChange={(e) => update({ size: e.target.value })}>
                <option value="">All</option>
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </label>
            <label>
              Color
              <select value={params.get('color') || ''} onChange={(e) => update({ color: e.target.value })}>
                <option value="">All</option>
                {['Black', 'Ivory', 'Olive', 'Stone', 'Navy', 'Grey', 'Indigo'].map((color) => (
                  <option key={color}>{color}</option>
                ))}
              </select>
            </label>
            <label>
              Price
              <select
                value={`${params.get('minPrice') || ''}-${params.get('maxPrice') || ''}`}
                onChange={(e) => {
                  const [minPrice, maxPrice] = e.target.value.split('-');
                  update({ minPrice, maxPrice });
                }}
              >
                <option value="-">All</option>
                <option value="-999">Under ₹999</option>
                <option value="1000-1999">₹1,000 – ₹1,999</option>
                <option value="2000-">₹2,000 and above</option>
              </select>
            </label>
            <label>
              Fit
              <select value={params.get('fit') || ''} onChange={(e) => update({ fit: e.target.value })}>
                <option value="">All</option>
                <option>Oversized</option>
                <option>Relaxed</option>
                <option>Regular</option>
              </select>
            </label>
            <label>
              Availability
              <select value={params.get('availability') || ''} onChange={(e) => update({ availability: e.target.value })}>
                <option value="">All</option>
                <option value="in">In stock</option>
                <option value="out">Sold out</option>
              </select>
            </label>
            <button type="button" className="text-btn" onClick={() => setParams(params.get('q') ? { q: params.get('q') } : {})}>
              Clear filters
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
