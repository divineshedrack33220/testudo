import { Router } from 'express';
import { 
  getServices, getService, getPublicServices, createService, updateService, deleteService, reorderServices 
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, serviceRules } from '../middleware/validate.js';

const router = Router();

router.get('/public', getPublicServices);
router.get('/', protect, authorize('admin', 'editor'), getServices);
router.put('/reorder', protect, authorize('admin', 'editor'), reorderServices);
router.get('/:id', protect, authorize('admin', 'editor'), getService);
router.post('/', protect, authorize('admin', 'editor'), validate(serviceRules), createService);
router.put('/:id', protect, authorize('admin', 'editor'), validate(serviceRules), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

export default router;