import { verifyAccess } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.user = verifyAccess(auth.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
