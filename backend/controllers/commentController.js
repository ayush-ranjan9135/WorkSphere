import { pool } from '../config/db.js';
import { log } from '../utils/activity.js';

export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;

    const { rows: [task] } = await pool.query(
      'SELECT project_id FROM tasks WHERE id = $1',
      [taskId]
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { rows: [comment] } = await pool.query(
      `INSERT INTO comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *,
         (SELECT name   FROM users WHERE id = $2) AS user_name,
         (SELECT avatar FROM users WHERE id = $2) AS user_avatar`,
      [taskId, req.user.id, content.trim()]
    );

    log({ project_id: task.project_id, task_id: taskId, user_id: req.user.id, action: 'comment_added' });
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

export const getComments = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, u.name AS user_name, u.avatar AS user_avatar
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.taskId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { rows: [deleted] } = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.commentId, req.user.id]
    );
    if (!deleted) return res.status(403).json({ message: 'Not allowed' });
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
};
