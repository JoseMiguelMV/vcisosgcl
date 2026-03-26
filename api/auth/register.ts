import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, generateTokens } from '../../lib/auth.js';
import { registerSchema } from '../../lib/validations.js';
import { sendWelcomeEmail } from '../../lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email, password, name, companyName } = result.data;

    const passwordHash = await hashPassword(password);

    const dbUser = await prisma.$transaction(async (tx) => {
      // Buscar o crear empresa
      let company = await tx.company.findUnique({ where: { name: companyName } });
      if (!company) {
        company = await tx.company.create({
          data: { name: companyName, rut: 'Sin RUT', legalContact: name, configured: false },
        });
      }

      // Verificar si el usuario ya existe en esta empresa
      const existingUser = await tx.user.findUnique({
        where: { email_companyId: { email, companyId: company.id } },
      });
      
      if (existingUser) {
        throw new Error('Este email ya está registrado en esta empresa');
      }

      const user = await tx.user.create({
        data: { email, passwordHash, name, role: 'ADMIN', companyId: company.id },
        include: { company: true },
      });

      return user;
    });

    const tokens = generateTokens(dbUser);

    await sendWelcomeEmail(email, name, companyName);

    return res.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      company: dbUser.company,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.message.includes('ya está registrado')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error en el registro' });
  }
}
