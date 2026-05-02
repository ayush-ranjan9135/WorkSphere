import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole, requireMember } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createProject, getProjects, getProject, updateProject, deleteProject,
  inviteMember, updateMemberRole, removeMember,
} from '../controllers/projectController.js';
import { getProjectActivity } from '../controllers/activityController.js';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', [body('name').notEmpty().trim()], validate, createProject);

router.get('/:projectId', requireMember, getProject);
router.patch('/:projectId', requireRole('admin'), [body('name').optional().notEmpty().trim()], validate, updateProject);
router.delete('/:projectId', requireRole('admin'), deleteProject);

router.post('/:projectId/members',
  requireRole('admin'),
  [body('email').isEmail(), body('role').optional().isIn(['admin', 'member'])],
  validate, inviteMember
);
router.patch('/:projectId/members/:userId',
  requireRole('admin'),
  [body('role').isIn(['admin', 'member'])],
  validate, updateMemberRole
);
router.delete('/:projectId/members/:userId', requireRole('admin'), removeMember);

router.get('/:projectId/activity', requireMember, getProjectActivity);

export default router;
