import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { createIncidentSchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (req.method === 'GET') {
    try {
      const incidents = await prisma.incident.findMany({
        where: { companyId: user.companyId },
        include: { logs: true },
        orderBy: { date: 'desc' },
      });
      return res.json(incidents);
    } catch (error) {
      console.error('Get incidents error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = createIncidentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const incident = await prisma.incident.create({
        data: {
          title: result.data.title,
          description: result.data.description,
          severity: result.data.severity,
          status: result.data.status,
          legalCountdown: result.data.legalCountdown,
          companyId: user.companyId,
          logs: result.data.logs ? {
            create: result.data.logs.map(log => ({
              action: log.action,
              user: log.user,
              date: new Date(log.date),
            })),
          } : undefined,
        },
        include: { logs: true },
      });
      return res.json(incident);
    } catch (error) {
      console.error('Create incident error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
