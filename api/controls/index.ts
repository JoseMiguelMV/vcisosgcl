import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (req.method === 'GET') {
    try {
      const controls = await prisma.control.findMany({
        where: { companyId: user.companyId },
        orderBy: { id: 'asc' },
      });
      return res.json(controls);
    } catch (error) {
      console.error('Get controls error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const schema = z.object({
        initialControls: z.array(z.object({
          id: z.string(),
          norm: z.string(),
          name: z.string(),
          state: z.string(),
          ley: z.string(),
        })),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      for (const ctrl of result.data.initialControls) {
        await prisma.control.upsert({
          where: { id_companyId: { id: ctrl.id, companyId: user.companyId } },
          update: { state: ctrl.state },
          create: { id: ctrl.id, norm: ctrl.norm, name: ctrl.name, state: ctrl.state, ley: ctrl.ley, companyId: user.companyId },
        });
      }
      return res.json({ message: 'Controls seeded successfully' });
    } catch (error) {
      console.error('Seed controls error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
