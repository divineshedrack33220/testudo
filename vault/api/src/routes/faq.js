import { Router } from 'express';
import { getFAQs, getFAQ, createFAQ, updateFAQ, deleteFAQ, bulkUpdateFAQs } from '../controllers/faqController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, authorize('admin', 'editor'), getFAQs);
router.get('/:id', protect, authorize('admin', 'editor'), getFAQ);
router.post('/', protect, authorize('admin'), createFAQ);
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);
router.put('/bulk', protect, authorize('admin'), bulkUpdateFAQs);

export default router;