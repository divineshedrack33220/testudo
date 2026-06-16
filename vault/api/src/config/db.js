import bcrypt from 'bcryptjs';
import { initDB, default as db } from './database.js';
import { seedPages } from './seedData.js';

export const connectDB = async () => {
  initDB();
  console.log('SQLite database connected');

  // Seed default admin user if not exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@testudong.com');
  if (!existing) {
    const hashed = await bcrypt.hash('password', 12);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@testudong.com', hashed, 'admin');
    console.log('Default admin user created: admin@testudong.com / password');
  }

  // Seed default pages if none exist
  const pageCount = db.prepare('SELECT COUNT(*) as count FROM pages').get().count;
  if (pageCount === 0) {
    seedPages();
    console.log('Default pages created: home, about, services, team, contact');
  }

  return db;
};

export const disconnectDB = async () => {
  db.close();
};
