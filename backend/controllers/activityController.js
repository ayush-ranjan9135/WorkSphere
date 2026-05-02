import { pool } from '../config/db.js';

export const getProjectActivity = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT al.*, u.name AS user_name, u.avatar AS user_avatar
       FROM activity_logs al JOIN users u ON u.id = al.user_id
       WHERE al.project_id = $1
       ORDER BY al.created_at DESC LIMIT 50`,
      [req.params.projectId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};
