import Message from '../models/Message.js';
import nodemailer from 'nodemailer';
import db from '../config/database.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export const getMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const p = Number(page);
    const lmt = Number(limit);
    const skip = (p - 1) * lmt;

    const messages = Message.find(query).sort({ createdAt: -1 }).skip(skip).limit(lmt);
    const total = Message.countDocuments(query);
    const unreadCount = Message.countDocuments({ status: 'unread' });
    
    res.json({ success: true, messages, total, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMessage = async (req, res) => {
  try {
    const message = Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createMessage = async (req, res) => {
  try {
    const message = Message.create({
      ...req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    if (process.env.NOTIFICATION_EMAIL) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: process.env.NOTIFICATION_EMAIL,
          subject: `New Contact: ${message.subject || 'No Subject'}`,
          html: `<p><strong>From:</strong> ${message.name} (${message.email})</p><p><strong>Message:</strong></p><p>${message.message}</p>`
        });
      } catch (mailErr) {
        console.warn('Failed to send email notification:', mailErr.message);
      }
    }
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { status, replyText } = req.body;
    const update = { status };
    
    if (replyText) {
      update.repliedAt = new Date().toISOString();
      update.repliedBy = req.user.id;
      update.replyText = replyText;
      update.status = 'replied';
    }
    
    const message = Message.findByIdAndUpdate(req.params.id, update);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    
    if (replyText) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: message.email,
          subject: `Re: ${message.subject || 'Your message'}`,
          html: `<p>Hi ${message.name},</p><p>${replyText}</p><hr><p>— ${req.user.name}</p>`
        });
      } catch (mailErr) {
        console.warn('Failed to send reply email:', mailErr.message);
      }
    }
    
    res.json({ success: true, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const bulkUpdateMessages = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE messages SET status = ?, updatedAt = datetime('now') WHERE id IN (${placeholders})`).run(status, ...ids);
    res.json({ success: true, message: `${ids.length} messages updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
