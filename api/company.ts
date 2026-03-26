import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../lib/middleware.js';
import { updateCompanySchema } from '../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (req.method === 'GET') {
    try {
      const company = await prisma.company.findUnique({ where: { id: user.companyId } });
      return res.json(company || {});
    } catch (error) {
      console.error('Get company error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = updateCompanySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const updated = await prisma.company.update({
        where: { id: user.companyId },
        data: result.data,
      });
      return res.json(updated);
    } catch (error) {
      console.error('Update company error:', error);
      return res.status(500).json({ error: 'Error actualizando empresa' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
