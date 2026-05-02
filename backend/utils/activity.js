import { pool } from '../config/db.js';

export const log = async ({ project_id = null, task_id = null, user_id, action, meta = {} }) => {
  await pool.query(
    `INSERT INTO activity_logs (project_id, task_id, user_id, action, meta)
     VALUES ($1, $2, $3, $4, $5)`,
    [project_id, task_id, user_id, action, meta]
  );
};
