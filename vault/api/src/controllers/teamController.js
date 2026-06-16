import Team from '../models/Team.js';
import db from '../config/database.js';

export const getTeam = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const p = Number(page);
    const lmt = Number(limit);
    const skip = (p - 1) * lmt;

    const members = Team.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(lmt);
    const total = Team.countDocuments(query);

    res.json({ success: true, members, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMember = async (req, res) => {
  try {
    const member = Team.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPublicTeam = async (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM team_members WHERE status = ? ORDER BY "order" ASC').all('active');
    res.json({ success: true, members: members.map(m => ({ ...m, skills: m.skills ? JSON.parse(m.skills) : [] })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createMember = async (req, res) => {
  try {
    const member = Team.create(req.body);
    res.status(201).json({ success: true, member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = Team.findByIdAndUpdate(req.params.id, req.body);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = Team.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const reorderTeam = async (req, res) => {
  try {
    const { members } = req.body;
    const stmt = db.prepare('UPDATE team_members SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
    const txn = db.transaction((items) => {
      for (const m of items) stmt.run(m.order || 0, m.id);
    });
    txn(members);
    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
