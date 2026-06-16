import { Router } from 'express';
import { getPartners, getPartner, createPartner, updatePartner, deletePartner, bulkUpdatePartners } from '../controllers/partnerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, authorize('admin', 'editor'), getPartners);
router.get('/:id', protect, authorize('admin', 'editor'), getPartner);
router.post('/', protect, authorize('admin'), createPartner);
router.put('/:id', protect, authorize('admin'), updatePartner);
router.delete('/:id', protect, authorize('admin'), deletePartner);
router.put('/bulk', protect, authorize('admin'), bulkUpdatePartners);

export default router;