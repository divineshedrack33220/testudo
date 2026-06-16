import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/public', getSettings);
router.get('/', protect, authorize('admin', 'editor'), getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

export default router;