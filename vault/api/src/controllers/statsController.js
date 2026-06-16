import db from '../config/database.js';

export const getStats = async (req, res) => {
  try {
    const pagesCount = db.prepare('SELECT COUNT(*) as count FROM pages').get().count;
    const servicesCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
    const teamCount = db.prepare('SELECT COUNT(*) as count FROM team_members').get().count;
    const messagesCount = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
    const unreadCount = db.prepare("SELECT COUNT(*) as count FROM messages WHERE status = 'unread'").get().count;

    res.json({
      success: true,
      stats: {
        totalPages: pagesCount,
        totalServices: servicesCount,
        totalTeam: teamCount,
        totalMessages: messagesCount,
        unreadMessages: unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
