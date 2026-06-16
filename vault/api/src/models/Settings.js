import db from '../config/database.js';

const SETTINGS_FIELDS = [
  'siteName', 'siteDescription', 'logo', 'favicon',
  'primaryColor', 'secondaryColor', 'accentColor',
  'contactEmail', 'contactPhone', 'contactAddress', 'officeHours',
  'social', 'analyticsId', 'googleAnalyticsId', 'facebookPixelId',
  'customHeadCode', 'customBodyCode', 'maintenanceMode', 'maintenanceMessage', 'mapsUrl'
];

function rowToSettings(row) {
  if (!row) return null;
  return {
    ...row,
    social: row.social ? JSON.parse(row.social) : {},
    maintenanceMode: !!row.maintenanceMode
  };
}

const Settings = {
  getSettings() {
    const row = db.prepare('SELECT * FROM settings LIMIT 1').get();
    if (row) return rowToSettings(row);
    db.prepare('INSERT INTO settings (siteName) VALUES (?)').run('Testudo');
    return rowToSettings(db.prepare('SELECT * FROM settings LIMIT 1').get());
  },

  findOneAndUpdate(filter, data, options = {}) {
    const existing = this.getSettings();
    if (!existing) return null;

    const row = { ...data };
    if (row.social && typeof row.social === 'object') row.social = JSON.stringify(row.social);

    const fields = [];
    const values = [];
    for (const key of SETTINGS_FIELDS) {
      if (row[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(row[key]);
      }
    }
    if (fields.length === 0) return existing;
    fields.push("updatedAt = datetime('now')");
    db.prepare(`UPDATE settings SET ${fields.join(', ')} WHERE id = ?`).run(...values, existing.id);
    return this.getSettings();
  }
};

export default Settings;
