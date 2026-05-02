import { hash, compare } from 'bcryptjs';
import { pool } from '../config/db.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await hash(password, 12);
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM users');
    const role = parseInt(countRows[0].count) === 0 ? 'admin' : 'member';

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
      [name, email, hashed, role]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    let decoded;
    try {
      decoded = verifyRefresh(refreshToken);
    } catch {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (!rows.length || rows[0].refresh_token !== refreshToken) {
      if (rows.length) await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [decoded.id]);
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const payload = { id: rows[0].id, email: rows[0].email };
    const newAccess = signAccess(payload);
    const newRefresh = signRefresh(payload);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefresh, rows[0].id]);
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [req.user.id]);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar)
       WHERE id = $3 RETURNING id, name, email, avatar, role, created_at`,
      [name, avatar, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
};
