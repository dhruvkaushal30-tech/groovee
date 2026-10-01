import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sellingPrice } from '../utils/pricing.js';
import { slugify } from '../utils/slug.js';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const text = String(value).trim();
  if (!text) return [];
  if (text.startsWith('[')) return JSON.parse(text);
  return text.split(',').map((item) => item.trim()).filter(Boolean);
}

export function buildProductData(body, files = [], existingImages = []) {
  const variants = parseList(body.variants).map((variant) => ({
    size: String(variant.size || '').trim(),
    color: String(variant.color || '').trim(),
    stock: Number(variant.stock) || 0,
    sku: String(variant.sku || '').trim(),
  }));

  if (!variants.length || variants.some((variant) => !variant.size || !variant.color)) {
    throw new AppError('Each variant needs a size and color', 400);
  }

  const uploaded = files.map((file) => `/uploads/${file.filename}`);
  const kept = parseList(body.existingImages);
  const images = uploaded.length ? [...kept, ...uploaded] : existingImages.length ? existingImages : kept;

  const price = Number(body.price);
  if (!body.name || !body.description || Number.isNaN(price)) {
    throw new AppError('Name, description, and price are required', 400);
  }

  const data = {
    name: body.name.trim(),
    description: body.description.trim(),
    price,
    category: body.category,
    brand: (body.brand || 'Groove').trim(),
    images,
    variants,
    fit: body.fit || '',
    fabric: body.fabric || '',
    careInstructions: body.careInstructions || '',
    tags: parseList(body.tags),
    isFeatured: body.isFeatured === true || body.isFeatured === 'true',
    isActive: body.isActive === undefined ? true : body.isActive === true || body.isActive === 'true',
  };

  if (body.discountPrice !== undefined && body.discountPrice !== '') {
    data.discountPrice = Number(body.discountPrice);
  } else {
    data.discountPrice = undefined;
  }

  data.sellingPrice = sellingPrice(data);
  data.variants = data.variants.map((variant) => ({
    ...variant,
    sku: variant.sku || `${slugify(data.name)}-${slugify(variant.size)}-${slugify(variant.color)}`,
  }));
  return data;
}

async function uniqueSlug(name, ignoreId) {
  const base = slugify(name) || 'product';
  let slug = base;
  let i = 2;
  while (await Product.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 48);
  const { category, size, color, minPrice, maxPrice, brand, availability, fit, sort, q, featured } = req.query;

  const filter = {};
  const includeInactive = req.query.includeInactive === 'true' && req.user?.role === 'ADMIN';
  if (!includeInactive) filter.isActive = true;

  if (category) {
    const cat = await Category.findOne({ slug: String(category).toLowerCase() });
    if (!cat) {
      return res.json({ products: [], page, limit, totalProducts: 0, totalPages: 0 });
    }
    filter.category = cat._id;
  }

  if (size) filter['variants.size'] = size;
  if (color) filter['variants.color'] = new RegExp(`^${escapeRegex(color)}$`, 'i');
  if (brand) filter.brand = new RegExp(escapeRegex(brand), 'i');
  if (fit) filter.fit = new RegExp(`^${escapeRegex(fit)}$`, 'i');
  if (availability === 'in') filter['variants.stock'] = { $gt: 0 };
  if (availability === 'out') filter.variants = { $not: { $elemMatch: { stock: { $gt: 0 } } } };
  if (featured === 'true') filter.isFeatured = true;

  const priceChecks = [];
  if (minPrice) priceChecks.push({ $gte: ['$sellingPrice', Number(minPrice)] });
  if (maxPrice) priceChecks.push({ $lte: ['$sellingPrice', Number(maxPrice)] });
  if (priceChecks.length) filter.$expr = { $and: priceChecks };

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { brand: rx }, { tags: rx }];
  }

  const sortMap = {
    featured: { isFeatured: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    price_asc: { sellingPrice: 1 },
    price_desc: { sellingPrice: -1 },
    bestselling: { soldCount: -1, createdAt: -1 },
  };

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortMap[sort] || sortMap.featured)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    page,
    limit,
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit) || 0,
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const product = await Product.findOne(query).populate('category', 'name slug');
  if (!product || (!product.isActive && req.user?.role !== 'ADMIN')) {
    throw new AppError('Product not found', 404);
  }
  res.json({ product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const data = buildProductData(req.body, req.files || []);
  if (!data.images.length) {
    throw new AppError('Upload at least one product image', 400);
  }
  const category = await Category.findById(data.category);
  if (!category) throw new AppError('Category not found', 400);
  data.slug = await uniqueSlug(data.name);
  const product = await Product.create(data);
  await product.populate('category', 'name slug');
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  const data = buildProductData(req.body, req.files || [], product.images);
  const category = await Category.findById(data.category);
  if (!category) throw new AppError('Category not found', 400);
  if (slugify(data.name) !== product.slug) {
    data.slug = await uniqueSlug(data.name, product._id);
  }
  Object.assign(product, data);
  if (data.discountPrice === undefined) product.discountPrice = undefined;
  await product.save();
  await product.populate('category', 'name slug');
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ message: 'Product deleted' });
});
