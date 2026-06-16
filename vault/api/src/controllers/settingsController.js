import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
  try {
    const settings = Settings.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = Settings.findOneAndUpdate({}, req.body);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
