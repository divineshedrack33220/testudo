import { Router } from 'express';
import { 
  getPages, getPage, getPublicPage, createPage, updatePage, deletePage, reorderPages 
} from '../controllers/pageController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, pageRules } from '../middleware/validate.js';

const router = Router();

// Public
router.get('/public/:slug', getPublicPage);

// Admin
router.get('/', protect, authorize('admin', 'editor'), getPages);
router.put('/reorder', protect, authorize('admin', 'editor'), reorderPages);
router.get('/:id', protect, authorize('admin', 'editor'), getPage);
router.post('/', protect, authorize('admin', 'editor'), validate(pageRules), createPage);
router.put('/:id', protect, authorize('admin', 'editor'), validate(pageRules), updatePage);
router.delete('/:id', protect, authorize('admin'), deletePage);

export default router;