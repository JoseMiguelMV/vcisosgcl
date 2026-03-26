import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, generateTokens } from '../../lib/auth.js';
import { registerSchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email, password, name } = result.data;

    const existing = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (existing) {
      return res.status(400).json({ error: 'SuperAdmin ya existe' });
    }

    const passwordHash = await hashPassword(password);

    const systemCompany = await prisma.company.upsert({
      where: { name: 'SISTEMA' },
      update: {},
      create: { name: 'SISTEMA', rut: '0-0', legalContact: 'ROOT', configured: true },
    });

    const user = await prisma.user.create({
      data: { email, passwordHash, name, role: 'SUPER_ADMIN', companyId: systemCompany.id },
      include: { company: true },
    });

    const tokens = generateTokens(user);

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('SuperAdmin setup error:', error);
    return res.status(500).json({ error: 'Error en la configuración' });
  }
}
