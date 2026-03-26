import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { updateControlSchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID requerido' });
    }

    const result = updateControlSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const control = await prisma.control.findUnique({
      where: { id_companyId: { id, companyId: user.companyId } },
    });

    if (!control) {
      return res.status(404).json({ error: 'Control no encontrado' });
    }

    const updated = await prisma.control.update({
      where: { id_companyId: { id, companyId: user.companyId } },
      data: { state: result.data.state },
    });
    return res.json(updated);
  } catch (error) {
    console.error('Update control error:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}
