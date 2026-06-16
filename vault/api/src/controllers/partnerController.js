import Partner from '../models/Partner.js';

export const getPartners = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, sort = 'order:1' } = req.query;
    const [sortField, sortDir] = sort.split(':');

    const query = {};
    if (status) query.status = status;
    if (search) query.search = search;

    const skip = (page - 1) * limit;
    const results = await Partner.find(query)
      .sort({ [sortField]: parseInt(sortDir) })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Partner.countDocuments(query);

    res.json({
      success: true,
      partners: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, partner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createPartner = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json({ success: true, partner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPartner = await Partner.findOneAndUpdate({ id }, req.body);
    if (!updatedPartner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, partner: updatedPartner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPartner = await Partner.findOneAndDelete({ id });
    if (!deletedPartner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, partner: deletedPartner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const bulkUpdatePartners = async (req, res) => {
  try {
    const { partners } = req.body;
    await Partner.bulkWrite(partners);
    res.json({ success: true, message: 'Partners updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};