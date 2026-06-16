import { Router } from 'express';
import { getTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial, bulkUpdateTestimonials } from '../controllers/testimonialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, authorize('admin', 'editor'), getTestimonials);
router.get('/:id', protect, authorize('admin', 'editor'), getTestimonial);
router.post('/', protect, authorize('admin'), createTestimonial);
router.put('/:id', protect, authorize('admin'), updateTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);
router.put('/bulk', protect, authorize('admin'), bulkUpdateTestimonials);

export default router;