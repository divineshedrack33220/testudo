import FAQ from '../models/FAQ.js';

export const getFAQs = async (req, res) => {
  try {
    const { status, search, category, page = 1, limit = 10, sort = 'order:1' } = req.query;
    const [sortField, sortDir] = sort.split(':');

    const query = {};
    if (status) query.status = status;
    if (search) query.search = search;
    if (category) query.category = category;

    const skip = (page - 1) * limit;
    const results = await FAQ.find(query)
      .sort({ [sortField]: parseInt(sortDir) })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FAQ.countDocuments(query);

    res.json({
      success: true,
      faqs: results,
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

export const getFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFAQ = await FAQ.findOneAndUpdate({ id }, req.body);
    if (!updatedFAQ) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, faq: updatedFAQ });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFAQ = await FAQ.findOneAndDelete({ id });
    if (!deletedFAQ) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, faq: deletedFAQ });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const bulkUpdateFAQs = async (req, res) => {
  try {
    const { faqs } = req.body;
    await FAQ.bulkWrite(faqs);
    res.json({ success: true, message: 'FAQs updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};