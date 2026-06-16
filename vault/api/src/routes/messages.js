import { Router } from 'express';
import { 
  getMessages, getMessage, createMessage, updateMessage, deleteMessage, bulkUpdateMessages 
} from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', createMessage);
router.put('/bulk', protect, authorize('admin', 'editor'), bulkUpdateMessages);
router.get('/', protect, authorize('admin', 'editor'), getMessages);
router.get('/:id', protect, authorize('admin', 'editor'), getMessage);
router.put('/:id', protect, authorize('admin', 'editor'), updateMessage);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

export default router;