import Category from '../../model/categoryModel.js';
import Link from '../../model/linkModel.js';

// Public read-only category handlers

export async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ order: 1 });
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Link.countDocuments({ category: cat._id });
        return { ...cat.toObject(), count };
      })
    );
    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getCategoryById(req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const links = await Link.find({ category: category._id }).sort({ createdAt: 1 });
    res.json({ ...category.toObject(), links });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
