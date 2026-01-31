import Link from '../../model/linkModel.js';

// Public read-only and stats handlers

export async function getLinksByCategory(req, res) {
  try {
    const links = await Link.find({ category: req.params.categoryId }).sort({ createdAt: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function incrementView(req, res) {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function incrementLike(req, res) {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function incrementReply(req, res) {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { $inc: { replies: 1 } },
      { new: true }
    );
    if (!link) return res.status(404).json({ message: 'Link not found' });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
