import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate.js';
import { requireMember } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTask, getTasks, getTask, updateTask, deleteTask, reorderTasks } from '../controllers/taskController.js';
import { addComment, getComments, deleteComment } from '../controllers/commentController.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireMember);

router.get('/', getTasks);
router.post('/',
  [body('title').notEmpty().trim(),
   body('status').optional().isIn(['todo', 'in_progress', 'done']),
   body('priority').optional().isIn(['low', 'medium', 'high']),
   body('deadline').optional().isISO8601()],
  validate, createTask
);
router.post('/reorder', reorderTasks);

router.get('/:taskId', getTask);
router.patch('/:taskId',
  [body('status').optional().isIn(['todo', 'in_progress', 'done']),
   body('priority').optional().isIn(['low', 'medium', 'high']),
   body('deadline').optional().isISO8601()],
  validate, updateTask
);
router.delete('/:taskId', deleteTask);

router.get('/:taskId/comments', getComments);
router.post('/:taskId/comments', [body('content').notEmpty().trim()], validate, addComment);
router.delete('/:taskId/comments/:commentId', deleteComment);

export default router;
