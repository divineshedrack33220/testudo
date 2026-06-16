import Service from '../models/Service.js';
import db from '../config/database.js';

export const getServices = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const p = Number(page);
    const lmt = Number(limit);
    const skip = (p - 1) * lmt;

    const services = Service.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(lmt);
    const total = Service.countDocuments(query);

    res.json({ success: true, services, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getService = async (req, res) => {
  try {
    const isNum = /^\d+$/.test(req.params.id);
    const service = isNum
      ? Service.findById(req.params.id)
      : Service.findOne({ slug: req.params.id });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPublicServices = async (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services WHERE status = ? ORDER BY "order" ASC').all('active');
    res.json({ success: true, services: services.map(s => ({ ...s, features: s.features ? JSON.parse(s.features) : [], seo: s.seo ? JSON.parse(s.seo) : null })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createService = async (req, res) => {
  try {
    const service = Service.create(req.body);
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = Service.findByIdAndUpdate(req.params.id, req.body);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const reorderServices = async (req, res) => {
  try {
    const { services } = req.body;
    const stmt = db.prepare('UPDATE services SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
    const txn = db.transaction((items) => {
      for (const s of items) stmt.run(s.order || 0, s.id);
    });
    txn(services);
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
