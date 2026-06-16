import db from '../config/database.js';

function rowToPartner(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id
  };
}

function partnerToRow(data) {
  const row = { ...data };
  return row;
}

const Partner = {
  find(query = {}) {
    let sql = 'SELECT * FROM partners WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    if (query.search) {
      sql += ' AND (name LIKE ?)';
      params.push(`%${query.search}%`);
    }
    return {
      sort(sortObj) {
        const sortField = Object.keys(sortObj)[0] || 'order';
        const sortDir = sortObj[sortField] === 1 ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${sortField} ${sortDir}`;
        return {
          skip(n) {
            sql += ` LIMIT ? OFFSET ?`;
            return {
              limit(m) {
                params.push(m, n);
                return db.prepare(sql).all(...params).map(rowToPartner);
              }
            };
          },
          limit(m) {
            sql += ` LIMIT ?`;
            params.push(m);
            return db.prepare(sql).all(...params).map(rowToPartner);
          }
        };
      },
      limit(m) {
        sql += ` LIMIT ?`;
        params.push(m);
        return db.prepare(sql).all(...params).map(rowToPartner);
      }
    };
  },

  findById(id) {
    return rowToPartner(db.prepare('SELECT * FROM partners WHERE id = ?').get(id));
  },

  findOne(conditions) {
    const { $or } = conditions;
    if ($or) {
      for (const cond of $or) {
        const [[field, val]] = Object.entries(cond);
        const row = db.prepare(`SELECT * FROM partners WHERE ${field} = ?`).get(String(val));
        if (row) return rowToPartner(row);
      }
    }
    const [[field, val]] = Object.entries(conditions);
    return rowToPartner(db.prepare(`SELECT * FROM partners WHERE ${field} = ?`).get(val));
  },

  create(data) {
    const row = partnerToRow(data);
    const stmt = db.prepare(
      `INSERT INTO partners (name, logo, website, description, "order", status)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      row.name, row.logo, row.website, row.description,
      row.order || 0, row.status || 'active'
    );
    return this.findById(result.lastInsertRowid);
  },

  findOneAndUpdate(filter, data, options = {}) {
    const existing = this.findOne(filter);
    if (!existing) return null;
    const merged = { ...existing, ...partnerToRow(data) };
    const fields = [];
    const values = [];
    for (const key of ['name', 'logo', 'website', 'description', 'order', 'status']) {
      if (merged[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(merged[key]);
      }
    }
    if (fields.length === 0) return existing;
    fields.push("updatedAt = datetime('now')");
    values.push(existing.id);
    db.prepare(`UPDATE partners SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(existing.id);
  },

  findOneAndDelete(filter) {
    const existing = this.findOne(filter);
    if (!existing) return null;
    db.prepare('DELETE FROM partners WHERE id = ?').run(existing.id);
    return existing;
  },

  countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM partners WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    const row = db.prepare(sql).get(...params);
    return row.count;
  },

  bulkWrite(ops) {
    const stmt = db.prepare('UPDATE partners SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
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

export default Partner;