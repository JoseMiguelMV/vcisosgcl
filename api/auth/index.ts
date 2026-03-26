import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '../../lib/auth.js';
import { loginSchema, registerSchema } from '../../lib/validations.js';
import { sendWelcomeEmail } from '../../lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;
  const method = req.method;

  try {
    if (action === 'login' || (method === 'POST' && !action)) {
      if (method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
      
      const result = loginSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

      const { email, password, companyName } = result.data;
      let user;
      
      if (companyName) {
        const company = await prisma.company.findUnique({ where: { name: companyName } });
        if (company) {
          user = await prisma.user.findUnique({
            where: { email_companyId: { email, companyId: company.id } },
            include: { company: true },
          });
        }
      } else {
        user = await prisma.user.findFirst({ where: { email }, include: { company: true } });
      }

      if (!user || !user.passwordHash || !await comparePassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const tokens = generateTokens(user);
      return res.json({
        id: user.id, email: user.email, name: user.name, role: user.role,
        company: user.company, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken,
      });
    }

    if (action === 'register') {
      if (method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

      const result = registerSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

      const { email, password, name, companyName } = result.data;
      const passwordHash = await hashPassword(password);

      const dbUser = await prisma.$transaction(async (tx) => {
        let company = await tx.company.findUnique({ where: { name: companyName } });
        if (!company) {
          company = await tx.company.create({
            data: { name: companyName, rut: 'Sin RUT', legalContact: name, configured: false },
          });
        }
        const existingUser = await tx.user.findUnique({
          where: { email_companyId: { email, companyId: company.id } },
        });
        if (existingUser) throw new Error('Este email ya está registrado en esta empresa');
        return tx.user.create({
          data: { email, passwordHash, name, role: 'ADMIN', companyId: company.id },
          include: { company: true },
        });
      });

      const tokens = generateTokens(dbUser);
      await sendWelcomeEmail(email, name, companyName).catch(() => {});

      return res.json({
        id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role,
        company: dbUser.company, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken,
      });
    }

    if (action === 'refresh') {
      if (method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'Refresh token requerido' });

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) return res.status(401).json({ error: 'Refresh token inválido' });

      const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { company: true } });
      if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

      const tokens = generateTokens(user);
      return res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    }

    if (action === 'setup-superadmin') {
      if (method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

      const result = registerSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

      const { email, password, name } = result.data;
      const existing = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
      if (existing) return res.status(400).json({ error: 'SuperAdmin ya existe' });

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
        id: user.id, email: user.email, name: user.name, role: user.role,
        company: user.company, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken,
      });
    }

    return res.status(400).json({ error: 'Acción no válida' });
  } catch (error: any) {
    console.error('Auth error:', error);
    if (error.message?.includes('ya está registrado')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error interno' });
  }
}
