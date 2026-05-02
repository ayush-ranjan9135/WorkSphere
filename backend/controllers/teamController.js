import { pool } from '../config/db.js';

export const createTeam = async (req, res, next) => {
  try {
    const { name, userIds = [] } = req.body;
    if (!name) return res.status(400).json({ message: 'Team name is required' });

    const { rows } = await pool.query(
      `INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *`,
      [name, req.user.id]
    );
    const team = rows[0];

    // Add creator + any provided users
    const allIds = [...new Set([req.user.id, ...userIds])];
    for (const uid of allIds) {
      await pool.query(
        `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [team.id, uid]
      );
    }

    res.status(201).json(await getTeamById(team.id));
  } catch (err) { next(err); }
};

export const getTeams = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.name AS created_by_name,
        COALESCE(json_agg(json_build_object('id', us.id, 'name', us.name, 'email', us.email))
          FILTER (WHERE us.id IS NOT NULL), '[]') AS members
       FROM teams t
       JOIN users u ON u.id = t.created_by
       LEFT JOIN team_members tm ON tm.team_id = t.id
       LEFT JOIN users us ON us.id = tm.user_id
       GROUP BY t.id, u.name
       ORDER BY t.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

export const deleteTeam = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [req.params.teamId]);
    res.json({ message: 'Team deleted' });
  } catch (err) { next(err); }
};

export const addTeamMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    await pool.query(
      `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.teamId, userId]
    );
    res.json(await getTeamById(req.params.teamId));
  } catch (err) { next(err); }
};

export const removeTeamMember = async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`,
      [req.params.teamId, req.params.userId]
    );
    res.json(await getTeamById(req.params.teamId));
  } catch (err) { next(err); }
};

export const assignTeamToProject = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const { rows: members } = await pool.query(
      `SELECT user_id FROM team_members WHERE team_id = $1`,
      [req.params.teamId]
    );

    for (const { user_id } of members) {
      await pool.query(
        `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'member')
         ON CONFLICT (project_id, user_id) DO NOTHING`,
        [projectId, user_id]
      );
    }

    res.json({ message: `${members.length} members added to project` });
  } catch (err) { next(err); }
};

// helper
async function getTeamById(teamId) {
  const { rows } = await pool.query(
    `SELECT t.*, u.name AS created_by_name,
      COALESCE(json_agg(json_build_object('id', us.id, 'name', us.name, 'email', us.email))
        FILTER (WHERE us.id IS NOT NULL), '[]') AS members
     FROM teams t
     JOIN users u ON u.id = t.created_by
     LEFT JOIN team_members tm ON tm.team_id = t.id
     LEFT JOIN users us ON us.id = tm.user_id
     WHERE t.id = $1
     GROUP BY t.id, u.name`,
    [teamId]
  );
  return rows[0];
}
