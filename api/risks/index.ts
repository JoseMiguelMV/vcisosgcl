import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { createRiskSchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (req.method === 'GET') {
    try {
      const risks = await prisma.risk.findMany({ where: { companyId: user.companyId } });
      return res.json(risks);
    } catch (error) {
      console.error('Get risks error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = createRiskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const risk = await prisma.risk.create({
        data: {
          title: result.data.title,
          impact: result.data.impact,
          probability: result.data.probability,
          plan: result.data.plan,
          description: result.data.description,
          companyId: user.companyId,
        },
      });
      return res.json(risk);
    } catch (error) {
      console.error('Create risk error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
