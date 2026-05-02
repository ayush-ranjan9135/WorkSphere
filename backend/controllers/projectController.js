import { pool } from '../config/db.js';
import { log } from '../utils/activity.js';

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, req.user.id]
    );
    const project = rows[0];
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'admin')`,
      [project.id, req.user.id]
    );
    await log({ project_id: project.id, user_id: req.user.id, action: 'project_created', meta: { name } });
    res.status(201).json(project);
  } catch (err) { next(err); }
};

export const getProjects = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, pm.role, u.name AS owner_name
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
       JOIN users u ON u.id = p.owner_id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

export const getProject = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS owner_name FROM projects p
       JOIN users u ON u.id = p.owner_id WHERE p.id = $1`,
      [req.params.projectId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Project not found' });

    const { rows: members } = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, pm.role, pm.joined_at
       FROM project_members pm JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [req.params.projectId]
    );
    res.json({ ...rows[0], members });
  } catch (err) { next(err); }
};

export const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { rows } = await pool.query(
      `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description),
       updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, description, req.params.projectId]
    );
    await log({ project_id: req.params.projectId, user_id: req.user.id, action: 'project_updated' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id',
      [req.params.projectId, req.user.id]
    );
    if (!rows.length) return res.status(403).json({ message: 'Only the project owner can delete this project' });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const { rows: userRows } = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (!userRows.length) return res.status(404).json({ message: 'User not found' });
    if (userRows[0].id === req.user.id) return res.status(400).json({ message: 'Cannot invite yourself' });

    const invitee = userRows[0];
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3`,
      [req.params.projectId, invitee.id, role]
    );

    await log({ project_id: req.params.projectId, user_id: req.user.id, action: 'member_invited', meta: { email, role } });

    res.json({ message: 'Member invited', userId: invitee.id, role });
  } catch (err) { next(err); }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const { rows: projectRows } = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [req.params.projectId]);
    if (projectRows[0]?.owner_id === userId) return res.status(400).json({ message: 'Cannot change owner role' });

    await pool.query(
      `UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3`,
      [role, req.params.projectId, userId]
    );
    await log({ project_id: req.params.projectId, user_id: req.user.id, action: 'role_updated', meta: { userId, role } });
    res.json({ message: 'Role updated' });
  } catch (err) { next(err); }
};

export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await pool.query(
      `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [req.params.projectId, userId]
    );
    await log({ project_id: req.params.projectId, user_id: req.user.id, action: 'member_removed', meta: { userId } });
    res.json({ message: 'Member removed' });
  } catch (err) { next(err); }
};
