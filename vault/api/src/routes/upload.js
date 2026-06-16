import { Router } from 'express';
import { uploadImage, deleteImage, listImages } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', protect, authorize('admin', 'editor'), listImages);
router.post('/', protect, authorize('admin', 'editor'), upload.single('file'), uploadImage);
router.delete('/', protect, authorize('admin'), deleteImage);

export default router;