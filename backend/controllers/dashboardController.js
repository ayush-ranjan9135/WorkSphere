import { pool } from '../config/db.js';

const EMPTY_STATS = { total: 0, todo: 0, in_progress: 0, done: 0, overdue: 0 };

export const getDashboard = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const { rows: memberships } = await pool.query(
      `SELECT p.id FROM projects p
       JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1`,
      [userId]
    );

    if (!memberships.length) {
      return res.json({ stats: EMPTY_STATS, overdue: [], assigned: [] });
    }

    const projectIds = memberships.map(p => p.id);

    const [{ rows: [stats] }, { rows: overdue }, { rows: assigned }] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*)::int                                                    AS total,
          COUNT(*) FILTER (WHERE status = 'todo')::int                    AS todo,
          COUNT(*) FILTER (WHERE status = 'in_progress')::int             AS in_progress,
          COUNT(*) FILTER (WHERE status = 'done')::int                    AS done,
          COUNT(*) FILTER (WHERE deadline < NOW() AND status != 'done')::int AS overdue
         FROM tasks WHERE project_id = ANY($1)`,
        [projectIds]
      ),
      pool.query(
        `SELECT t.*, p.name AS project_name FROM tasks t
         JOIN projects p ON p.id = t.project_id
         WHERE t.assignee_id = $1 AND t.deadline < NOW() AND t.status != 'done'
         ORDER BY t.deadline ASC LIMIT 10`,
        [userId]
      ),
      pool.query(
        `SELECT t.*, p.name AS project_name FROM tasks t
         JOIN projects p ON p.id = t.project_id
         WHERE t.assignee_id = $1 AND t.status != 'done'
         ORDER BY t.deadline ASC NULLS LAST LIMIT 20`,
        [userId]
      ),
    ]);

    res.json({ stats, overdue, assigned });
  } catch (err) { next(err); }
};
