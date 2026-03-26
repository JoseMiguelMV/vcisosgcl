import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Token requerido' });

  const { action, id } = req.query;

  if (action === 'seed') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const schema = z.object({
      initialControls: z.array(z.object({
        id: z.string(), norm: z.string(), name: z.string(),
        state: z.string(), ley: z.string(),
      })),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

    for (const ctrl of result.data.initialControls) {
      await prisma.control.upsert({
        where: { id_companyId: { id: ctrl.id, companyId: user.companyId } },
        update: { state: ctrl.state },
        create: { id: ctrl.id, norm: ctrl.norm, name: ctrl.name, state: ctrl.state, ley: ctrl.ley, companyId: user.companyId },
      });
    }
    return res.json({ message: 'Controls seeded successfully' });
  }

  if (id) {
    if (req.method === 'PUT') {
      const updateSchema = z.object({
        state: z.enum(['No iniciado', 'Implementado', 'En progreso', 'En curso', 'No implementado', 'Auditado', 'No aplicable']),
      });
      const result = updateSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

      const control = await prisma.control.findUnique({
        where: { id_companyId: { id: id as string, companyId: user.companyId } },
      });
      if (!control) return res.status(404).json({ error: 'Control no encontrado' });

      const updated = await prisma.control.update({
        where: { id_companyId: { id: id as string, companyId: user.companyId } },
        data: { state: result.data.state },
      });
      return res.json(updated);
    }
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (req.method === 'GET') {
    const controls = await prisma.control.findMany({
      where: { companyId: user.companyId },
      orderBy: { id: 'asc' },
    });
    return res.json(controls);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
