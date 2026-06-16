import db from '../config/database.js';

function rowToMember(row) {
  if (!row) return null;
  return {
    ...row,
    skills: row.skills ? JSON.parse(row.skills) : []
  };
}

function memberToRow(data) {
  const row = { ...data };
  if (row.skills && typeof row.skills === 'object') row.skills = JSON.stringify(row.skills);
  return row;
}

const Team = {
  find(query = {}) {
    let sql = 'SELECT * FROM team_members WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    return {
      sort(sortObj) {
        const entries = Object.entries(sortObj);
        const clauses = entries.map(([f, d]) => `"${f}" ${d === 1 ? 'ASC' : 'DESC'}`);
        sql += ` ORDER BY ${clauses.join(', ')}`;
        return {
          skip(n) {
            sql += ` LIMIT ? OFFSET ?`;
            return {
              limit(m) {
                params.push(m, n);
                return db.prepare(sql).all(...params).map(rowToMember);
              }
            };
          },
          limit(m) {
            sql += ` LIMIT ?`;
            params.push(m);
            return db.prepare(sql).all(...params).map(rowToMember);
          }
        };
      },
      limit(m) {
        sql += ` LIMIT ?`;
        params.push(m);
        return db.prepare(sql).all(...params).map(rowToMember);
      }
    };
  },

  findById(id) {
    return rowToMember(db.prepare('SELECT * FROM team_members WHERE id = ?').get(id));
  },

  create(data) {
    const row = memberToRow(data);
    const stmt = db.prepare(
      `INSERT INTO team_members (name, role, bio, image, email, linkedin, twitter, skills, "order", status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      row.name, row.role, row.bio || null, row.image || null,
      row.email || null, row.linkedin || null, row.twitter || null,
      row.skills || null, row.order || 0, row.status || 'active'
    );
    return this.findById(result.lastInsertRowid);
  },

  findByIdAndUpdate(id, data, options = {}) {
    const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    if (!existing) return null;
    const merged = { ...existing, ...memberToRow(data) };
    const fields = [];
    const values = [];
    for (const key of ['name', 'role', 'bio', 'image', 'email', 'linkedin', 'twitter', 'skills', 'order', 'status']) {
      if (merged[key] !== undefined) {
        fields.push(`"${key}" = ?`);
        values.push(merged[key]);
      }
    }
    if (fields.length === 0) return rowToMember(existing);
    fields.push("updatedAt = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE team_members SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  findByIdAndDelete(id) {
    const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    if (!existing) return null;
    db.prepare('DELETE FROM team_members WHERE id = ?').run(id);
    return rowToMember(existing);
  },

  countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM team_members WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    return db.prepare(sql).get(...params).count;
  },

  bulkWrite(ops) {
    const stmt = db.prepare('UPDATE team_members SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
    const transaction = db.transaction((items) => {
      for (const op of items) {
        if (op.updateOne) {
          stmt.run(op.updateOne.update.$set.order, op.updateOne.filter._id);
        }
      }
    });
    transaction(ops);
  }
};

export default Team;
