import Page from '../models/Page.js';
import db from '../config/database.js';

export const getPages = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.search = search;

    const p = Number(page);
    const lmt = Number(limit);
    const skip = (p - 1) * lmt;

    const pages = Page.find(query).sort({ createdAt: -1 }).skip(skip).limit(lmt);
    const total = Page.countDocuments(query);

    res.json({ success: true, pages, total, page: p, totalPages: Math.ceil(total / lmt) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPage = async (req, res) => {
  try {
    const isNum = /^\d+$/.test(req.params.id);
    const page = isNum
      ? Page.findById(req.params.id)
      : Page.findOne({ slug: req.params.id });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPublicPage = async (req, res) => {
  try {
    const page = db.prepare('SELECT * FROM pages WHERE slug = ? AND status = ?').get(req.params.slug, 'published');
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page: { ...page, sections: page.sections ? JSON.parse(page.sections) : [], seo: page.seo ? JSON.parse(page.seo) : null } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createPage = async (req, res) => {
  try {
    const page = Page.create(req.body);
    res.status(201).json({ success: true, page });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePage = async (req, res) => {
  try {
    const isNum = /^\d+$/.test(req.params.id);
    const filter = isNum ? { id: req.params.id } : { slug: req.params.id };
    const page = Page.findOneAndUpdate(filter, req.body);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePage = async (req, res) => {
  try {
    const isNum = /^\d+$/.test(req.params.id);
    const filter = isNum ? { id: req.params.id } : { slug: req.params.id };
    const page = Page.findOneAndDelete(filter);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const reorderPages = async (req, res) => {
  try {
    const { pages } = req.body;
    const stmt = db.prepare('UPDATE pages SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
    const txn = db.transaction((items) => {
      for (const p of items) stmt.run(p.order || 0, p.id);
    });
    txn(pages);
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
