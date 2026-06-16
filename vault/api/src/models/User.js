import db from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = {
  findById(id, selectPassword) {
    const query = selectPassword
      ? 'SELECT * FROM users WHERE id = ?'
      : 'SELECT id, name, email, role, avatar, isActive, lastLogin, createdAt, updatedAt FROM users WHERE id = ?';
    const row = db.prepare(query).get(id);
    if (!row) return null;
    row.isActive = !!row.isActive;
    return row;
  },

  findOne(field, value) {
    const row = db.prepare(`SELECT * FROM users WHERE ${field} = ?`).get(value);
    if (!row) return null;
    row.isActive = !!row.isActive;
    return row;
  },

  create(data) {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(data.name, data.email, data.password, data.role || 'editor', data.avatar || null);
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
      if (key !== 'id' && key !== 'createdAt') {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0) return this.findById(id);
    fields.push("updatedAt = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  async comparePassword(candidate, hashed) {
    return bcrypt.compare(candidate, hashed);
  }
};

export default User;
