import Testimonial from '../models/Testimonial.js';

export const getTestimonials = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, sort = 'order:1' } = req.query;
    const [sortField, sortDir] = sort.split(':');

    const query = {};
    if (status) query.status = status;
    if (search) query.search = search;

    const skip = (page - 1) * limit;
    const results = await Testimonial.find(query)
      .sort({ [sortField]: parseInt(sortDir) })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      testimonials: results,
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

export const getTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTestimonial = await Testimonial.findOneAndUpdate({ id }, req.body);
    if (!updatedTestimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, testimonial: updatedTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTestimonial = await Testimonial.findOneAndDelete({ id });
    if (!deletedTestimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, testimonial: deletedTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const bulkUpdateTestimonials = async (req, res) => {
  try {
    const { testimonials } = req.body;
    await Testimonial.bulkWrite(testimonials);
    res.json({ success: true, message: 'Testimonials updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};