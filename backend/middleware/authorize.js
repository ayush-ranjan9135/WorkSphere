import { pool } from '../config/db.js';

const getMemberRole = async (projectId, userId) => {
  const { rows } = await pool.query(
    `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  return rows[0]?.role || null;
};

export const requireRole = (...roles) => async (req, res, next) => {
  try {
    const role = await getMemberRole(req.params.projectId, req.user.id);
    if (!role) return res.status(403).json({ message: 'Not a project member' });
    if (!roles.includes(role)) return res.status(403).json({ message: 'Insufficient permissions' });
    req.projectRole = role;
    next();
  } catch (err) { next(err); }
};

export const requireMember = async (req, res, next) => {
  try {
    const role = await getMemberRole(req.params.projectId, req.user.id);
    if (!role) return res.status(403).json({ message: 'Not a project member' });
    req.projectRole = role;
    next();
  } catch (err) { next(err); }
};
