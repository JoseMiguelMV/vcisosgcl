import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { comparePassword, generateTokens } from '../../lib/auth.js';
import { loginSchema } from '../../lib/validations.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email, password, companyName } = result.data;

    // Si viene companyName, buscar por email + empresa
    // Si no viene companyName, buscar en todas las empresas del usuario
    let user;
    
    if (companyName) {
      // Buscar empresa por nombre
      const company = await prisma.company.findUnique({ where: { name: companyName } });
      if (company) {
        user = await prisma.user.findUnique({
          where: { email_companyId: { email, companyId: company.id } },
          include: { company: true },
        });
      }
    } else {
      // Buscar el usuario sin importar empresa (toma el primero)
      user = await prisma.user.findFirst({
        where: { email },
        include: { company: true },
      });
    }

    if (!user || !user.passwordHash || !await comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

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
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
