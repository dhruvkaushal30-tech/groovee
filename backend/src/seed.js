import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { Category } from './models/Category.js';
import { Coupon } from './models/Coupon.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { uploadsDir } from './middleware/upload.middleware.js';

dotenv.config();

function svgFile(filename, { bg, ink, label, subtitle }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="${bg}"/>
  <rect x="70" y="70" width="660" height="860" fill="none" stroke="${ink}" stroke-width="2"/>
  <path d="M250 280h300l40 90v360H210V370z" fill="none" stroke="${ink}" stroke-width="3"/>
  <path d="M310 280c10-50 170-50 180 0" fill="none" stroke="${ink}" stroke-width="3"/>
  <text x="400" y="820" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="${ink}">${label}</text>
  <text x="400" y="870" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="${ink}">${subtitle}</text>
</svg>`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, svg);
  return `/uploads/${filename}`;
}

const categories = [
  { name: 'New In', slug: 'new-in', description: 'Just landed pieces from the latest cut.' },
  { name: 'Hoodies', slug: 'hoodies', description: 'Heavyweight layers with a relaxed shoulder.' },
  { name: 'T-Shirts', slug: 't-shirts', description: 'Oversized tees in sturdy cotton.' },
  { name: 'Bottoms', slug: 'bottoms', description: 'Wide legs, easy trousers, and denim.' },
];

const catalog = [
  {
    name: 'Box Fit Hoodie',
    category: 'hoodies',
    price: 2499,
    discountPrice: 2199,
    fit: 'Oversized',
    fabric: '420 GSM cotton fleece',
    tags: ['hoodie', 'oversized', 'fleece'],
    isFeatured: true,
    soldCount: 48,
    colors: [
      { name: 'Black', bg: '#1c1917', ink: '#f5f0e8' },
      { name: 'Ivory', bg: '#f3efe6', ink: '#1c1917' },
    ],
  },
  {
    name: 'Studio Heavy Hoodie',
    category: 'hoodies',
    price: 2799,
    fit: 'Oversized',
    fabric: '460 GSM brushed fleece',
    tags: ['hoodie', 'heavyweight'],
    isFeatured: true,
    soldCount: 36,
    colors: [
      { name: 'Olive', bg: '#3e4636', ink: '#f4f1ea' },
      { name: 'Stone', bg: '#d9d2c5', ink: '#1c1917' },
    ],
  },
  {
    name: 'Drop Shoulder Tee',
    category: 't-shirts',
    price: 1299,
    discountPrice: 1099,
    fit: 'Oversized',
    fabric: '240 GSM combed cotton',
    tags: ['t-shirt', 'tee', 'oversized'],
    isFeatured: true,
    soldCount: 72,
    colors: [
      { name: 'Black', bg: '#171717', ink: '#f6f3ee' },
      { name: 'Ivory', bg: '#f7f3ea', ink: '#1c1917' },
    ],
  },
  {
    name: 'Essential Heavy Tee',
    category: 't-shirts',
    price: 1499,
    fit: 'Relaxed',
    fabric: '260 GSM cotton jersey',
    tags: ['t-shirt', 'essential'],
    isFeatured: false,
    soldCount: 21,
    colors: [
      { name: 'Navy', bg: '#1e2a3a', ink: '#f4f1ea' },
      { name: 'Grey', bg: '#c8c4bc', ink: '#1c1917' },
    ],
  },
  {
    name: 'Wide Leg Trouser',
    category: 'bottoms',
    price: 2199,
    fit: 'Relaxed',
    fabric: 'Cotton twill',
    tags: ['bottoms', 'trouser'],
    isFeatured: true,
    soldCount: 18,
    colors: [
      { name: 'Stone', bg: '#e4dccf', ink: '#1c1917' },
      { name: 'Black', bg: '#22201c', ink: '#f6f3ee' },
    ],
  },
  {
    name: 'Relaxed Denim',
    category: 'bottoms',
    price: 2499,
    discountPrice: 2299,
    fit: 'Relaxed',
    fabric: '12 oz selvedge-style denim',
    tags: ['bottoms', 'denim', 'jeans'],
    isFeatured: false,
    soldCount: 27,
    colors: [
      { name: 'Indigo', bg: '#24344a', ink: '#f3efe6' },
      { name: 'Stone', bg: '#cfc6b8', ink: '#1c1917' },
    ],
  },
  {
    name: 'New Drop Crewneck',
    category: 'new-in',
    price: 1999,
    fit: 'Oversized',
    fabric: '380 GSM loopback cotton',
    tags: ['new', 'crewneck', 'sweatshirt'],
    isFeatured: true,
    soldCount: 12,
    colors: [
      { name: 'Ivory', bg: '#f6f1e7', ink: '#1c1917' },
      { name: 'Olive', bg: '#4a5340', ink: '#f6f3ee' },
    ],
  },
  {
    name: 'Market Shirt',
    category: 'new-in',
    price: 1799,
    fit: 'Relaxed',
    fabric: 'Washed cotton poplin',
    tags: ['new', 'shirt'],
    isFeatured: false,
    soldCount: 9,
    colors: [
      { name: 'Ivory', bg: '#efe8dc', ink: '#1c1917' },
      { name: 'Navy', bg: '#1a2740', ink: '#f6f3ee' },
    ],
  },
];

function variantsFor(product, slug) {
  const sizes = ['S', 'M', 'L', 'XL'];
  const variants = [];
  for (const color of product.colors) {
    sizes.forEach((size, index) => {
      variants.push({
        size,
        color: color.name,
        stock: size === 'S' ? 4 : 8 + index,
        sku: `${slug}-${size.toLowerCase()}-${color.name.toLowerCase()}`,
      });
    });
  }
  return variants;
}

async function seed() {
  await connectDatabase();
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const email = (process.env.ADMIN_EMAIL || 'admin@veld.store').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    {
      firstName: 'Groove',
      lastName: 'Admin',
      email,
      password: passwordHash,
      phone: '9999999999',
      role: 'ADMIN',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  for (const category of categories) {
    await Category.findOneAndUpdate({ slug: category.slug }, category, { upsert: true, new: true });
  }
  const categoryDocs = await Category.find();
  const bySlug = Object.fromEntries(categoryDocs.map((item) => [item.slug, item]));

  for (const item of catalog) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const images = item.colors.map((color, index) =>
      svgFile(`${slug}-${index + 1}.svg`, {
        bg: color.bg,
        ink: color.ink,
        label: item.name,
        subtitle: color.name,
      })
    );
    await Product.findOneAndUpdate(
      { slug },
      {
        name: item.name,
        slug,
        description: `${item.name} is cut with a roomy shoulder and a clean hem. Made for everyday wear, with a weight you can feel.`,
        price: item.price,
        discountPrice: item.discountPrice,
        sellingPrice: item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price,
        category: bySlug[item.category]._id,
        brand: 'Groove',
        images,
        variants: variantsFor(item, slug),
        fit: item.fit,
        fabric: item.fabric,
        careInstructions: 'Machine wash cold. Dry flat. Do not bleach.',
        tags: item.tags,
        isFeatured: item.isFeatured,
        isActive: true,
        soldCount: item.soldCount,
      },
      { upsert: true, new: true }
    );
  }

  const expiry = new Date('2026-12-31T23:59:59.000Z');
  await Coupon.findOneAndUpdate(
    { code: 'VELD10' },
    {
      code: 'VELD10',
      discountPercent: 10,
      minOrder: 999,
      expiry,
      usageLimit: 100,
      isActive: true,
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Seeded admin ${email}`);
  console.log('Seeded categories, products, and coupon VELD10');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
