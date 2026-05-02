import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;

const requiredEnv = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN'];
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

export const signAccess = (payload) =>
  sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const signRefresh = (payload) =>
  sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

export const verifyAccess = (token) => verify(token, process.env.JWT_SECRET);

export const verifyRefresh = (token) => verify(token, process.env.JWT_REFRESH_SECRET);
