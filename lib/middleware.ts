import type { VercelRequest } from '@vercel/node';
import { verifyAccessToken } from './auth.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  companyId: string;
}

export const authenticateToken = (req: VercelRequest): AuthUser | null => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  const decoded = verifyAccessToken(token);
  if (!decoded) return null;

  return decoded as AuthUser;
};

export const requireAuth = (req: VercelRequest) => {
  const user = authenticateToken(req);
  if (!user) {
    throw { status: 401, message: 'Token requerido o inválido' };
  }
  return user;
};

export const requireRole = (user: AuthUser, roles: string[]) => {
  if (!roles.includes(user.role)) {
    throw { status: 403, message: 'Acceso denegado' };
  }
};
