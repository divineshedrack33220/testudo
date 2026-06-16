import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = User.findOne('email', email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) {
      return res.status(429).json({ success: false, message: 'Account temporarily locked. Try again in 15 minutes.' });
    }
    
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
      User.update(user.id, { loginAttempts: user.loginAttempts, lockUntil: user.lockUntil || null });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    User.update(user.id, { loginAttempts: 0, lockUntil: null, lastLogin: new Date().toISOString() });
    
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = User.update(req.user.id, { name, email, avatar });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = User.findById(req.user.id, true);
    
    if (!(await User.comparePassword(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }
    
    const hashed = await User.hashPassword(newPassword);
    User.update(user.id, { password: hashed });
    
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
