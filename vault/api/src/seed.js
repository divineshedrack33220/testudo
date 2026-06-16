import { initDB } from './config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    const db = initDB();
    console.log('SQLite database connected');

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@testudobranding.com');
    if (existing) {
      console.log('Admin user already exists');
    } else {
      const hashed = await bcrypt.hash('password', 12);
      db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@testudobranding.com', hashed, 'admin');
      console.log('Admin user created: admin@testudobranding.com / password');
    }

    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
