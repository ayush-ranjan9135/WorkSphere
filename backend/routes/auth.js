import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, refresh, logout, getMe, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/signup',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate, signup
);
router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate, login
);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);

export default router;
