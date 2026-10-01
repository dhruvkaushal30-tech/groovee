import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ initial = '', onSubmit }) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const query = value.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop');
    if (onSubmit) onSubmit(query);
  }

  return (
    <form className="search-bar" onSubmit={submit}>
      <input
        type="search"
        placeholder="Search products..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Search products"
      />
      <button type="submit">Search</button>
    </form>
  );
}
