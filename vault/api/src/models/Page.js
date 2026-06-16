import db from '../config/database.js';

function rowToPage(row) {
  if (!row) return null;
  return {
    ...row,
    sections: row.sections ? JSON.parse(row.sections) : [],
    seo: row.seo ? JSON.parse(row.seo) : null,
    id: row.id
  };
}

function pageToRow(data) {
  const row = { ...data };
  if (row.sections && typeof row.sections === 'object') row.sections = JSON.stringify(row.sections);
  if (row.seo && typeof row.seo === 'object') row.seo = JSON.stringify(row.seo);
  return row;
}

const Page = {
  find(query = {}) {
    let sql = 'SELECT * FROM pages WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    if (query.search) {
      sql += ' AND (title LIKE ? OR slug LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
    }
    return {
      sort(sortObj) {
        const sortField = Object.keys(sortObj)[0] || 'createdAt';
        const sortDir = sortObj[sortField] === 1 ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${sortField} ${sortDir}`;
        return {
          skip(n) {
            sql += ` LIMIT ? OFFSET ?`;
            return {
              limit(m) {
                params.push(m, n);
                return db.prepare(sql).all(...params).map(rowToPage);
              }
            };
          },
          limit(m) {
            sql += ` LIMIT ?`;
            params.push(m);
            return db.prepare(sql).all(...params).map(rowToPage);
          }
        };
      },
      limit(m) {
        sql += ` LIMIT ?`;
        params.push(m);
        return db.prepare(sql).all(...params).map(rowToPage);
      }
    };
  },

  findById(id) {
    return rowToPage(db.prepare('SELECT * FROM pages WHERE id = ?').get(id));
  },

  findOne(conditions) {
    const { $or } = conditions;
    if ($or) {
      for (const cond of $or) {
        const [[field, val]] = Object.entries(cond);
        const row = db.prepare(`SELECT * FROM pages WHERE ${field} = ?`).get(String(val));
        if (row) return rowToPage(row);
      }
    }
    const [[field, val]] = Object.entries(conditions);
    return rowToPage(db.prepare(`SELECT * FROM pages WHERE ${field} = ?`).get(val));
  },

  create(data) {
    const row = pageToRow(data);
    const stmt = db.prepare(
      `INSERT INTO pages (title, slug, description, sections, seo, status, template, publishedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      row.title, row.slug, row.description || null,
      row.sections || null, row.seo || null,
      row.status || 'draft', row.template || 'default', row.publishedAt || null
    );
    return this.findById(result.lastInsertRowid);
  },

  findOneAndUpdate(filter, data, options = {}) {
    const existing = this.findOne(filter);
    if (!existing) return null;
    const merged = { ...existing, ...pageToRow(data) };
    const fields = [];
    const values = [];
    for (const key of ['title', 'slug', 'description', 'sections', 'seo', 'status', 'template', 'publishedAt']) {
      if (merged[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(merged[key]);
      }
    }
    if (fields.length === 0) return existing;
    fields.push("updatedAt = datetime('now')");
    values.push(existing.id);
    db.prepare(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(existing.id);
  },

  findOneAndDelete(filter) {
    const existing = this.findOne(filter);
    if (!existing) return null;
    db.prepare('DELETE FROM pages WHERE id = ?').run(existing.id);
    return existing;
  },

  countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM pages WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    const row = db.prepare(sql).get(...params);
    return row.count;
  },

  bulkWrite(ops) {
    const stmt = db.prepare('UPDATE pages SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
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

export default Page;
