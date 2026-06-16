import db from '../config/database.js';
import slugify from 'slugify';

function rowToService(row) {
  if (!row) return null;
  return {
    ...row,
    features: row.features ? JSON.parse(row.features) : [],
    seo: row.seo ? JSON.parse(row.seo) : null
  };
}

function serviceToRow(data) {
  const row = { ...data };
  if (row.features && typeof row.features === 'object') row.features = JSON.stringify(row.features);
  if (row.seo && typeof row.seo === 'object') row.seo = JSON.stringify(row.seo);
  if (!row.slug && row.title) {
    row.slug = slugify(row.title, { lower: true, strict: true });
  }
  return row;
}

const Service = {
  find(query = {}) {
    let sql = 'SELECT * FROM services WHERE 1=1';
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
                return db.prepare(sql).all(...params).map(rowToService);
              }
            };
          },
          limit(m) {
            sql += ` LIMIT ?`;
            params.push(m);
            return db.prepare(sql).all(...params).map(rowToService);
          }
        };
      },
      limit(m) {
        sql += ` LIMIT ?`;
        params.push(m);
        return db.prepare(sql).all(...params).map(rowToService);
      }
    };
  },

  findById(id) {
    return rowToService(db.prepare('SELECT * FROM services WHERE id = ?').get(id));
  },

  findOne(conditions) {
    const { $or } = conditions || conditions;
    if ($or) {
      for (const cond of $or) {
        const [[field, val]] = Object.entries(cond);
        const row = db.prepare(`SELECT * FROM services WHERE ${field} = ?`).get(String(val));
        if (row) return rowToService(row);
      }
    }
    const [[field, val]] = Object.entries(conditions);
    return rowToService(db.prepare(`SELECT * FROM services WHERE ${field} = ?`).get(val));
  },

  create(data) {
    const row = serviceToRow(data);
    const stmt = db.prepare(
      `INSERT INTO services (title, slug, shortDescription, description, icon, image, features, price, "order", status, seo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      row.title, row.slug, row.shortDescription || null, row.description || null,
      row.icon || null, row.image || null, row.features || null, row.price || null,
      row.order || 0, row.status || 'draft', row.seo || null
    );
    return this.findById(result.lastInsertRowid);
  },

  findByIdAndUpdate(id, data, options = {}) {
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!existing) return null;
    const merged = { ...existing, ...serviceToRow(data) };
    const fields = [];
    const values = [];
    for (const key of ['title', 'slug', 'shortDescription', 'description', 'icon', 'image', 'features', 'price', 'order', 'status', 'seo']) {
      if (merged[key] !== undefined) {
        fields.push(`"${key}" = ?`);
        values.push(merged[key]);
      }
    }
    if (fields.length === 0) return rowToService(existing);
    fields.push("updatedAt = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  findByIdAndDelete(id) {
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!existing) return null;
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    return rowToService(existing);
  },

  countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM services WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    return db.prepare(sql).get(...params).count;
  },

  bulkWrite(ops) {
    const stmt = db.prepare('UPDATE services SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
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

export default Service;
