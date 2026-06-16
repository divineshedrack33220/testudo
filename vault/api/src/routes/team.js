import { Router } from 'express';
import { 
  getTeam, getMember, getPublicTeam, createMember, updateMember, deleteMember, reorderTeam 
} from '../controllers/teamController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, teamRules } from '../middleware/validate.js';

const router = Router();

router.get('/public', getPublicTeam);
router.get('/', protect, authorize('admin', 'editor'), getTeam);
router.put('/reorder', protect, authorize('admin', 'editor'), reorderTeam);
router.get('/:id', protect, authorize('admin', 'editor'), getMember);
router.post('/', protect, authorize('admin', 'editor'), validate(teamRules), createMember);
router.put('/:id', protect, authorize('admin', 'editor'), validate(teamRules), updateMember);
router.delete('/:id', protect, authorize('admin'), deleteMember);

export default router;