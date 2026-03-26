import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { hashPassword } from '../../lib/auth.js';
import { createUserSchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        where: { companyId: user.companyId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      return res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = createUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const { email, password, name, role } = result.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const passwordHash = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: { email, passwordHash, name, role, companyId: user.companyId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });

      return res.json(newUser);
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({ error: 'Error creando usuario' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
