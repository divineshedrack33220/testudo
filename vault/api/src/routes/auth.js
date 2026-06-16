import { Router } from 'express';
import { login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, authRules } from '../middleware/validate.js';

const router = Router();

router.post('/login', validate(authRules.login), login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, validate(authRules.register), changePassword);

export default router;