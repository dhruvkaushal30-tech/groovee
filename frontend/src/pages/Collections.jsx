import { Link } from 'react-router-dom';

const groups = [
  { title: 'New In', to: '/shop?category=new-in', copy: 'The latest cuts, before they settle into the line.' },
  { title: 'Hoodies', to: '/shop?category=hoodies', copy: 'Heavy fleece with a boxy shoulder.' },
  { title: 'T-Shirts', to: '/shop?category=t-shirts', copy: 'Dropped sleeves and sturdy cotton.' },
  { title: 'Bottoms', to: '/shop?category=bottoms', copy: 'Trousers and denim with an easy leg.' },
];

export default function Collections() {
  return (
    <div className="page-narrow wide">
      <p className="eyebrow">Collections</p>
      <h1>Shop by cloth</h1>
      <div className="collection-list">
        {groups.map((group) => (
          <Link key={group.title} to={group.to} className="category-banner">
            <span>{group.copy}</span>
            <strong>{group.title}</strong>
            <em>Shop now</em>
          </Link>
        ))}
      </div>
    </div>
  );
}
