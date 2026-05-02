import { pool } from '../config/db.js';
import { log } from '../utils/activity.js';

export const createTask = async (req, res, next) => {
  try {
    const project_id = req.params.projectId;
    const { title, description, status, priority, assignee_id, deadline } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    const { rows } = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, created_by, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [project_id, title, description, status || 'todo', priority || 'medium', assignee_id || null, req.user.id, deadline || null]
    );
    const task = rows[0];

    await log({ project_id, task_id: task.id, user_id: req.user.id, action: 'task_created', meta: { title } });
    res.status(201).json(task);
  } catch (err) { next(err); }
};

export const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee_id, search, overdue } = req.query;

    let query = `
      SELECT t.*, u.name AS assignee_name, u.avatar AS assignee_avatar, c.name AS creator_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assignee_id
      LEFT JOIN users c ON c.id = t.created_by
      WHERE t.project_id = $1`;
    const params = [projectId];
    let i = 2;

    if (status)      { query += ` AND t.status = $${i++}`;      params.push(status); }
    if (priority)    { query += ` AND t.priority = $${i++}`;    params.push(priority); }
    if (assignee_id) { query += ` AND t.assignee_id = $${i++}`; params.push(assignee_id); }
    if (search)      { query += ` AND t.title ILIKE $${i++}`;   params.push(`%${search}%`); }
    if (overdue === 'true') query += ` AND t.deadline < NOW() AND t.status != 'done'`;

    query += ` ORDER BY t.position ASC, t.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
};

export const getTask = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.name AS assignee_name, u.avatar AS assignee_avatar
       FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = $1`,
      [req.params.taskId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, deadline } = req.body;
    const assignee_id = req.body.hasOwnProperty('assignee_id') ? (req.body.assignee_id || null) : undefined;
    const { taskId } = req.params;

    const prev = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!prev.rows.length) return res.status(404).json({ message: 'Task not found' });

    const becomingDone = status === 'done' && prev.rows[0].status !== 'done';
    const becomingUndone = status && status !== 'done' && prev.rows[0].status === 'done';

    const { rows } = await pool.query(
      `UPDATE tasks SET
        title        = COALESCE($1, title),
        description  = COALESCE($2, description),
        status       = COALESCE($3, status),
        priority     = COALESCE($4, priority),
        assignee_id  = CASE WHEN $5::boolean THEN $6::uuid ELSE assignee_id END,
        deadline     = CASE WHEN $7::boolean THEN $8::timestamptz ELSE deadline END,
        completed_at = CASE WHEN $9::boolean THEN NOW() WHEN $10::boolean THEN NULL ELSE completed_at END,
        updated_at   = NOW()
       WHERE id = $11 RETURNING *`,
      [
        title ?? null, description ?? null, status ?? null, priority ?? null,
        req.body.hasOwnProperty('assignee_id'), assignee_id,
        req.body.hasOwnProperty('deadline'), deadline ?? null,
        becomingDone, becomingUndone,
        taskId,
      ]
    );
    const task = rows[0];

    await log({ project_id: task.project_id, task_id: taskId, user_id: req.user.id, action: 'task_updated', meta: { status, priority } });
    res.json(task);
  } catch (err) { next(err); }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING project_id, title', [req.params.taskId]);
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });
    await log({ project_id: rows[0].project_id, user_id: req.user.id, action: 'task_deleted', meta: { title: rows[0].title } });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || !tasks.length)
      return res.status(400).json({ message: 'tasks must be a non-empty array' });

    for (const t of tasks) {
      if (!t.id || t.position === undefined || !t.status)
        return res.status(400).json({ message: 'Each task must have id, position, and status' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const t of tasks) {
        await client.query(
          `UPDATE tasks SET position = $1, status = $2, updated_at = NOW() WHERE id = $3`,
          [t.position, t.status, t.id]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ message: 'Tasks reordered' });
  } catch (err) { next(err); }
};
