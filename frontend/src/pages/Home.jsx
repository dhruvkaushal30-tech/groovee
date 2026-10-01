import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { api } from '../services/api';

const banners = [
  { title: 'Oversized T-shirts', to: '/shop?category=t-shirts', note: 'Heavy cotton, dropped shoulder' },
  { title: 'Hoodies', to: '/shop?category=hoodies', note: 'Fleece you can feel' },
  { title: 'Bottoms', to: '/shop?category=bottoms', note: 'Wide legs, easy cloth' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [best, setBest] = useState([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=4').then((res) => setFeatured(res.data.products));
    api.get('/products?sort=bestselling&limit=4').then((res) => setBest(res.data.products));
  }, []);

  return (
    <div>
      <section className="hero">
        <p className="eyebrow">New drop</p>
        <h1>Explore the latest collection</h1>
        <p>Roomy cuts, quiet colours, cloth with weight.</p>
        <Link to="/shop" className="btn">
          Shop now
        </Link>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Fresh drops</h2>
          <Link to="/shop?sort=newest">View all</Link>
        </div>
        <ProductGrid products={featured} />
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Best sellers</h2>
          <Link to="/shop?sort=bestselling">View all</Link>
        </div>
        <ProductGrid products={best} />
      </section>
      <section className="banner-grid">
        {banners.map((banner) => (
          <Link key={banner.title} to={banner.to} className="category-banner">
            <span>{banner.note}</span>
            <strong>{banner.title}</strong>
            <em>Shop now</em>
          </Link>
        ))}
      </section>
    </div>
  );
}
