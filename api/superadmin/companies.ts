import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { authenticateToken } from '../../lib/middleware.js';
import { hashPassword } from '../../lib/auth.js';
import { createSuperAdminCompanySchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  if (user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  if (req.method === 'GET') {
    try {
      const companies = await prisma.company.findMany({
        where: { NOT: { name: 'SISTEMA' } },
        include: { users: { where: { role: 'ADMIN' } } },
      });
      return res.json(companies);
    } catch (error) {
      console.error('Get companies error:', error);
      return res.status(500).json({ error: 'Error interno' });
    }
  }

  if (req.method === 'POST') {
    try {
      const result = createSuperAdminCompanySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }

      const { companyName, rut, adminEmail, adminPassword, adminName } = result.data;
      const passwordHash = await hashPassword(adminPassword);

      const dbResult = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: { name: companyName, rut: rut || 'Sin RUT', legalContact: adminName, configured: false },
        });
        const newUser = await tx.user.create({
          data: { email: adminEmail, passwordHash, name: adminName, role: 'ADMIN', companyId: company.id },
        });
        return { company, user: newUser };
      });

      return res.json(dbResult);
    } catch (error) {
      console.error('Create company error:', error);
      return res.status(500).json({ error: 'Error creando empresa' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
