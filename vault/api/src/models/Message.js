import db from '../config/database.js';

function rowToMessage(row) {
  return row;
}

const Message = {
  find(query = {}) {
    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    return {
      sort(sortObj) {
        const entries = Object.entries(sortObj);
        const clauses = entries.map(([f, d]) => `${f} ${d === 1 ? 'ASC' : 'DESC'}`);
        sql += ` ORDER BY ${clauses.join(', ')}`;
        return {
          skip(n) {
            sql += ` LIMIT ? OFFSET ?`;
            return {
              limit(m) {
                params.push(m, n);
                return db.prepare(sql).all(...params).map(rowToMessage);
              }
            };
          },
          limit(m) {
            sql += ` LIMIT ?`;
            params.push(m);
            return db.prepare(sql).all(...params).map(rowToMessage);
          }
        };
      },
      limit(m) {
        sql += ` LIMIT ?`;
        params.push(m);
        return db.prepare(sql).all(...params).map(rowToMessage);
      }
    };
  },

  findById(id) {
    return rowToMessage(db.prepare('SELECT * FROM messages WHERE id = ?').get(id));
  },

  create(data) {
    const stmt = db.prepare(
      `INSERT INTO messages (name, email, subject, message, phone, company, status, source, ip, userAgent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      data.name, data.email, data.subject || null, data.message,
      data.phone || null, data.company || null,
      data.status || 'unread', data.source || 'contact-form',
      data.ip || null, data.userAgent || null
    );
    return this.findById(result.lastInsertRowid);
  },

  findByIdAndUpdate(id, data, options = {}) {
    const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!existing) return null;
    const merged = { ...existing, ...data };
    const fields = [];
    const values = [];
    for (const key of ['name', 'email', 'subject', 'message', 'phone', 'company', 'status', 'source', 'repliedAt', 'repliedBy', 'replyText']) {
      if (merged[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(merged[key]);
      }
    }
    if (fields.length === 0) return existing;
    fields.push("updatedAt = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  findByIdAndDelete(id) {
    const existing = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!existing) return null;
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return existing;
  },

  countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM messages WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    return db.prepare(sql).get(...params).count;
  },

  updateMany(conditions, update) {
    const { $in } = conditions._id || {};
    if ($in && update.$set) {
      const placeholders = $in.map(() => '?').join(',');
      db.prepare(`UPDATE messages SET ${Object.keys(update.$set)[0]} = ?, updatedAt = datetime('now') WHERE id IN (${placeholders})`)
        .run(Object.values(update.$set)[0], ...$in);
    }
  }
};

export default Message;
