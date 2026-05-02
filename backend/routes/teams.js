import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createTeam, getTeams, deleteTeam, addTeamMember, removeTeamMember, assignTeamToProject } from '../controllers/teamController.js';

const router = Router();

router.use(authenticate);

router.get('/', getTeams);
router.post('/', [body('name').notEmpty().trim()], validate, createTeam);
router.delete('/:teamId', deleteTeam);
router.post('/:teamId/members', [body('userId').notEmpty()], validate, addTeamMember);
router.delete('/:teamId/members/:userId', removeTeamMember);
router.post('/:teamId/assign', [body('projectId').notEmpty()], validate, assignTeamToProject);

export default router;
