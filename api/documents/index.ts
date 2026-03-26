import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { createDocumentSchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (req.method === 'GET') {
    try {
      const docs = await prisma.document.findMany({
        where: { companyId: user.companyId },
        orderBy: { date: 'desc' },
      });
      return res.json(docs);
    } catch (error) {
      console.error('Get documents error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = createDocumentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const doc = await prisma.document.create({
        data: {
          name: result.data.name,
          type: result.data.type,
          folder: result.data.folder,
          size: result.data.size,
          author: result.data.author,
          companyId: user.companyId,
        },
      });
      return res.json(doc);
    } catch (error) {
      console.error('Create document error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
