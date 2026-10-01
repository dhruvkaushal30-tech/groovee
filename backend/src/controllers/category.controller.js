import { Category } from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slug.js';

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) throw new AppError('Category name is required', 400);
  const category = await Category.create({
    name,
    slug: slugify(name),
    description: req.body.description || '',
  });
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  if (req.body.name) {
    category.name = req.body.name.trim();
    category.slug = slugify(category.name);
  }
  if (req.body.description !== undefined) category.description = req.body.description;
  await category.save();
  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  res.json({ message: 'Category deleted' });
});
