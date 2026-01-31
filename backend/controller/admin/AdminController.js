import Category from '../../model/categoryModel.js';
import Link from '../../model/linkModel.js';
import Visitor from '../../model/visitorModel.js';

// ----- Admin Categories -----

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

export async function createCategory(req, res) {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ----- Admin Links -----

export async function getLinksByCategory(req, res) {
  try {
    const links = await Link.find({ category: req.params.categoryId }).sort({ createdAt: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getLinkById(req, res) {
  try {
    const link = await Link.findById(req.params.id).populate('category', 'name order');
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/** Normalize link body: only url, label, category; category can be id or { _id }. */
function normalizeLinkBody(body) {
  if (!body || typeof body !== 'object') return {};
  const category = body.category;
  const categoryId = category && typeof category === 'object' && category._id
    ? category._id
    : category;
  return {
    ...(body.url !== undefined && { url: body.url }),
    ...(body.label !== undefined && { label: body.label }),
    ...(categoryId !== undefined && categoryId !== '' && { category: categoryId }),
  };
}

export async function createLink(req, res) {
  try {
    const body = normalizeLinkBody(req.body);
    if (!body.url || !body.category) {
      return res.status(400).json({
        message: 'Link requires url and category. Send { url, label?, category }.',
      });
    }
    const link = new Link(body);
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    const msg = error.name === 'ValidationError' && error.message
      ? error.message
      : (error.message || 'Validation failed');
    res.status(400).json({ message: msg });
  }
}

export async function updateLink(req, res) {
  try {
    const body = normalizeLinkBody(req.body);
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ message: 'Send at least one of: url, label, category.' });
    }
    const link = await Link.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json(link);
  } catch (error) {
    const msg = error.name === 'ValidationError' && error.message
      ? error.message
      : (error.message || 'Validation failed');
    res.status(400).json({ message: msg });
  }
}

export async function deleteLink(req, res) {
  try {
    const link = await Link.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ----- Admin Visitors -----

export async function getVisitors(req, res) {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getVisitorById(req, res) {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createVisitor(req, res) {
  try {
    const body = { ...req.body };
    if (body.deviceID == null) body.deviceID = [];
    if (body.noOfDevice == null) body.noOfDevice = body.deviceID?.length ?? 1;
    const visitor = new Visitor(body);
    await visitor.save();
    res.status(201).json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateVisitor(req, res) {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteVisitor(req, res) {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json({ message: 'Visitor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
