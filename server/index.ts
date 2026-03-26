import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production-super-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-this-in-production-refresh-secret';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const hashPassword = (password: string) => bcrypt.hash(password, 12);
const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

const generateTokens = (user: { id: string; email: string; role: string; companyId: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes. Intente en 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

const getCompanyId = (req: express.Request) => req.headers['x-company-id'] as string;

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  (req as any).user = decoded;
  next();
};

const validateOwnership = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const companyId = getCompanyId(req);
  const user = (req as any).user;

  if (user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (companyId && user.companyId !== companyId) {
    return res.status(403).json({ error: 'No tiene acceso a esta empresa' });
  }

  next();
};

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  companyName: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  companyName: z.string().min(2, 'Nombre de empresa debe tener al menos 2 caracteres'),
});

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  role: z.enum(['ADMIN', 'USER']),
});

const createRiskSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  impact: z.number().min(1).max(5),
  probability: z.number().min(1).max(5),
  plan: z.string().min(1, 'Plan requerido'),
  description: z.string().min(1, 'Descripción requerida'),
});

const createIncidentSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  severity: z.enum(['Bajo', 'Medio', 'Alto', 'Crítico']),
  status: z.enum(['Nuevo', 'En Proceso', 'Resuelto', 'Cerrado']),
  legalCountdown: z.number().optional(),
  logs: z.array(z.object({
    action: z.string(),
    user: z.string(),
    date: z.string(),
  })).optional(),
});

const createDocumentSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.string().min(1, 'Tipo requerido'),
  folder: z.string().min(1, 'Carpeta requerida'),
  size: z.string().min(1, 'Tamaño requerido'),
  author: z.string().min(1, 'Autor requerido'),
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email, password, companyName } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        email,
        ...(companyName ? { company: { name: companyName } } : {}),
      },
      include: { company: true },
    });

    if (!user || !await comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const tokens = generateTokens(user);

    res.json({
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const tokens = generateTokens(user);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email, password, name, companyName } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await hashPassword(password);

    const dbUser = await prisma.$transaction(async (tx) => {
      let company = await tx.company.findUnique({ where: { name: companyName } });
      if (!company) {
        company = await tx.company.create({
          data: { name: companyName, rut: 'Sin RUT', legalContact: name, configured: false },
        });
      }

      const user = await tx.user.create({
        data: { email, passwordHash, name, role: 'ADMIN', companyId: company.id },
        include: { company: true },
      });

      return user;
    });

    const tokens = generateTokens(dbUser);

    res.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      company: dbUser.company,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error en el registro' });
  }
});

app.post('/api/auth/setup-superadmin', authLimiter, async (req, res) => {
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

    res.json({
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
    res.status(500).json({ error: 'Error en la configuración' });
  }
});

app.get('/api/superadmin/companies', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const companies = await prisma.company.findMany({
      where: { NOT: { name: 'SISTEMA' } },
      include: { users: { where: { role: 'ADMIN' } } },
    });
    res.json(companies);
  } catch (error) {
    console.error('SuperAdmin companies error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/superadmin/companies', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const schema = z.object({
      companyName: z.string().min(2),
      rut: z.string().optional(),
      adminEmail: z.string().email(),
      adminPassword: z.string().min(8),
      adminName: z.string().min(2),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { companyName, rut, adminEmail, adminPassword, adminName } = result.data;
    const passwordHash = await hashPassword(adminPassword);

    const dbResult = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName, rut: rut || 'Sin RUT', legalContact: adminName, configured: false },
      });
      const user = await tx.user.create({
        data: { email: adminEmail, passwordHash, name: adminName, role: 'ADMIN', companyId: company.id },
      });
      return { company, user };
    });

    res.json(dbResult);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Error creando empresa' });
  }
});

app.get('/api/admin/users', authenticateToken, validateOwnership, async (req, res) => {
  try {
    const user = (req as any).user;
    const companyId = user.companyId;

    const users = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/admin/users', authenticateToken, validateOwnership, async (req, res) => {
  try {
    const user = (req as any).user;
    const companyId = user.companyId;

    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { email, password, name, role } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: { email, passwordHash, name, role, companyId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

app.get('/api/company', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const company = await prisma.company.findUnique({ where: { id: user.companyId } });
    res.json(company || {});
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/company', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const schema = z.object({
      name: z.string().min(1),
      rut: z.string().min(1),
      legalContact: z.string().min(1),
      configured: z.boolean().optional(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const updated = await prisma.company.update({
      where: { id: user.companyId },
      data: result.data,
    });
    res.json(updated);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Error actualizando empresa' });
  }
});

app.get('/api/controls', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const controls = await prisma.control.findMany({
      where: { companyId: user.companyId },
      orderBy: { id: 'asc' },
    });
    res.json(controls);
  } catch (error) {
    console.error('Get controls error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.put('/api/controls/:id', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const schema = z.object({
      state: z.enum(['Implementado', 'En progreso', 'No implementado', 'Auditado', 'No aplicable']),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const control = await prisma.control.findUnique({
      where: { id_companyId: { id: String(id), companyId: user.companyId } },
    });

    if (!control) {
      return res.status(404).json({ error: 'Control no encontrado' });
    }

    const updated = await prisma.control.update({
      where: { id_companyId: { id: String(id), companyId: user.companyId } },
      data: { state: result.data.state },
    });
    res.json(updated);
  } catch (error) {
    console.error('Update control error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/controls/seed', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const schema = z.object({
      initialControls: z.array(z.object({
        id: z.string(),
        norm: z.string(),
        name: z.string(),
        state: z.string(),
        ley: z.string(),
      })),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    for (const ctrl of result.data.initialControls) {
      await prisma.control.upsert({
        where: { id_companyId: { id: ctrl.id, companyId: user.companyId } },
        update: { state: ctrl.state },
        create: { id: ctrl.id, norm: ctrl.norm, name: ctrl.name, state: ctrl.state, ley: ctrl.ley, companyId: user.companyId },
      });
    }
    res.json({ message: 'Controls seeded successfully' });
  } catch (error) {
    console.error('Seed controls error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/risks', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const risks = await prisma.risk.findMany({ where: { companyId: user.companyId } });
    res.json(risks);
  } catch (error) {
    console.error('Get risks error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/risks', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const result = createRiskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const risk = await prisma.risk.create({
      data: { ...result.data, companyId: user.companyId },
    });
    res.json(risk);
  } catch (error) {
    console.error('Create risk error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/incidents', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const incidents = await prisma.incident.findMany({
      where: { companyId: user.companyId },
      include: { logs: true },
      orderBy: { date: 'desc' },
    });
    res.json(incidents);
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/incidents', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const result = createIncidentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { logs, ...incidentData } = result.data;

    const incident = await prisma.incident.create({
      data: {
        ...incidentData,
        companyId: user.companyId,
        logs: logs ? {
          create: logs.map(log => ({
            action: log.action,
            user: log.user,
            date: new Date(log.date),
          })),
        } : undefined,
      },
      include: { logs: true },
    });
    res.json(incident);
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const docs = await prisma.document.findMany({
      where: { companyId: user.companyId },
      orderBy: { date: 'desc' },
    });
    res.json(docs);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/documents', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const result = createDocumentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const doc = await prisma.document.create({
      data: { ...result.data, companyId: user.companyId },
    });
    res.json(doc);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
