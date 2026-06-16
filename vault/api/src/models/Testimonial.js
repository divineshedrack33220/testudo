import db from '../config/database.js';

function rowToTestimonial(row) {
  if (!row) return null;
  return {
    ...row,
    rating: row.rating || 5,
    id: row.id
  };
}

function testimonialToRow(data) {
  const row = { ...data };
  return row;
}

const Testimonial = {
  find(query = {}) {
    let sql = 'SELECT * FROM testimonials WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    if (query.search) {
      sql += ' AND (name LIKE ? OR content LIKE ?)';
      params.push(`%${query.search}%`, `%${query.search}%`);
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
                return db.prepare(sql).all(...params).map(rowToTestimonial);
              }
            };
          },
          limit(m) {
            sql += ` LIMIT ?`;
            params.push(m);
            return db.prepare(sql).all(...params).map(rowToTestimonial);
          }
        };
      },
      limit(m) {
        sql += ` LIMIT ?`;
        params.push(m);
        return db.prepare(sql).all(...params).map(rowToTestimonial);
      }
    };
  },

  findById(id) {
    return rowToTestimonial(db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id));
  },

  findOne(conditions) {
    const { $or } = conditions;
    if ($or) {
      for (const cond of $or) {
        const [[field, val]] = Object.entries(cond);
        const row = db.prepare(`SELECT * FROM testimonials WHERE ${field} = ?`).get(String(val));
        if (row) return rowToTestimonial(row);
      }
    }
    const [[field, val]] = Object.entries(conditions);
    return rowToTestimonial(db.prepare(`SELECT * FROM testimonials WHERE ${field} = ?`).get(val));
  },

  create(data) {
    const row = testimonialToRow(data);
    const stmt = db.prepare(
      `INSERT INTO testimonials (name, position, company, content, image, rating, "order", status, seo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      row.name, row.position, row.company, row.content, row.image,
      row.rating || 5, row.order || 0, row.status || 'active', row.seo || null
    );
    return this.findById(result.lastInsertRowid);
  },

  findOneAndUpdate(filter, data, options = {}) {
    const existing = this.findOne(filter);
    if (!existing) return null;
    const merged = { ...existing, ...testimonialToRow(data) };
    const fields = [];
    const values = [];
    for (const key of ['name', 'position', 'company', 'content', 'image', 'rating', 'order', 'status', 'seo']) {
      if (merged[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(merged[key]);
      }
    }
    if (fields.length === 0) return existing;
    fields.push("updatedAt = datetime('now')");
    values.push(existing.id);
    db.prepare(`UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(existing.id);
  },

  findOneAndDelete(filter) {
    const existing = this.findOne(filter);
    if (!existing) return null;
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(existing.id);
    return existing;
  },

  countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) as count FROM testimonials WHERE 1=1';
    const params = [];
    if (query.status) { sql += ' AND status = ?'; params.push(query.status); }
    const row = db.prepare(sql).get(...params);
    return row.count;
  },

  bulkWrite(ops) {
    const stmt = db.prepare('UPDATE testimonials SET "order" = ?, updatedAt = datetime(\'now\') WHERE id = ?');
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

export default Testimonial;