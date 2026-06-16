import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.resolve(__dirname, '../../data');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'testudo.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor' CHECK(role IN ('admin','editor','viewer')),
      avatar TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      lastLogin TEXT,
      loginAttempts INTEGER NOT NULL DEFAULT 0,
      lockUntil TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sections TEXT,
      seo TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
      template TEXT NOT NULL DEFAULT 'default',
      "order" INTEGER NOT NULL DEFAULT 0,
      publishedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      shortDescription TEXT,
      description TEXT,
      icon TEXT,
      image TEXT,
      features TEXT,
      price TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','inactive')),
      seo TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      image TEXT,
      email TEXT,
      linkedin TEXT,
      twitter TEXT,
      skills TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      status TEXT NOT NULL DEFAULT 'unread' CHECK(status IN ('unread','read','replied','archived')),
      source TEXT NOT NULL DEFAULT 'contact-form',
      ip TEXT,
      userAgent TEXT,
      repliedAt TEXT,
      repliedBy INTEGER REFERENCES users(id),
      replyText TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siteName TEXT NOT NULL DEFAULT 'Testudo',
      siteDescription TEXT NOT NULL DEFAULT 'Technical & Procurement Solutions',
      logo TEXT,
      favicon TEXT,
      primaryColor TEXT NOT NULL DEFAULT '#01a1d1',
      secondaryColor TEXT NOT NULL DEFAULT '#FF9800',
      accentColor TEXT NOT NULL DEFAULT '#00a1d1',
      contactEmail TEXT NOT NULL DEFAULT 'info@testudong.com',
      contactPhone TEXT NOT NULL DEFAULT '+234 1 234 5678',
      contactAddress TEXT NOT NULL DEFAULT 'Lagos, Nigeria',
      officeHours TEXT NOT NULL DEFAULT 'Monday — Friday, 8:00 AM — 5:00 PM',
      social TEXT,
      analyticsId TEXT,
      googleAnalyticsId TEXT,
      facebookPixelId TEXT,
      customHeadCode TEXT,
      customBodyCode TEXT,
      maintenanceMode INTEGER NOT NULL DEFAULT 0,
      maintenanceMessage TEXT,
      mapsUrl TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT,
      company TEXT,
      content TEXT NOT NULL,
      image TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      "order" INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      seo TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      website TEXT,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Ensure settings row exists
  const row = db.prepare('SELECT id FROM settings LIMIT 1').get();
  if (!row) {
    db.prepare('INSERT INTO settings (siteName) VALUES (?)').run('Testudo');
  }

  return db;
}

export default db;
