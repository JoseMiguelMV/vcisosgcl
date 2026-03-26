import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// AUTH
app.post('/api/auth', (req, res) => {
  const { action } = req.query;
  
  if (action === 'login' || !action) {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      companyName: z.string().optional(),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

    const { email, password, companyName } = result.data;
    
    prisma.user.findFirst({ where: { email }, include: { company: true } })
      .then(async (user) => {
        if (!user || !user.passwordHash || !await bcrypt.compare(password, user.passwordHash)) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role, companyId: user.companyId }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role, company: user.company, accessToken, refreshToken });
      });
    return;
  }

  if (action === 'register') {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
      companyName: z.string().min(2),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

    const { email, password, name, companyName } = result.data;
    
    prisma.$transaction(async (tx) => {
      let company = await tx.company.findUnique({ where: { name: companyName } });
      if (!company) {
        company = await tx.company.create({
          data: { name: companyName, rut: 'Sin RUT', legalContact: name, configured: false },
        });
      }
      const existingUser = await tx.user.findUnique({ where: { email_companyId: { email, companyId: company.id } } });
      if (existingUser) throw new Error('Este email ya está registrado en esta empresa');
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await tx.user.create({
        data: { email, passwordHash, name, role: 'ADMIN', companyId: company.id },
        include: { company: true },
      });
      const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role, companyId: user.companyId }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role, company: user.company, accessToken, refreshToken });
    }).catch((err) => {
      res.status(400).json({ error: err.message });
    });
    return;
  }

  if (action === 'refresh') {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token requerido' });
    
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      prisma.user.findUnique({ where: { id: decoded.id }, include: { company: true } })
        .then((user) => {
          if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
          const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role, companyId: user.companyId }, JWT_SECRET, { expiresIn: '15m' });
          const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
          res.json({ accessToken, refreshToken: newRefreshToken });
        });
    } catch {
      res.status(401).json({ error: 'Refresh token inválido' });
    }
    return;
  }

  if (action === 'setup-superadmin') {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

    prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } })
      .then(async (existing) => {
        if (existing) return res.status(400).json({ error: 'SuperAdmin ya existe' });
        const { email, password, name } = result.data;
        const passwordHash = await bcrypt.hash(password, 12);
        const systemCompany = await prisma.company.upsert({
          where: { name: 'SISTEMA' },
          update: {},
          create: { name: 'SISTEMA', rut: '0-0', legalContact: 'ROOT', configured: true },
        });
        const user = await prisma.user.create({
          data: { email, passwordHash, name, role: 'SUPER_ADMIN', companyId: systemCompany.id },
          include: { company: true },
        });
        const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role, companyId: user.companyId }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role, company: user.company, accessToken, refreshToken });
      });
    return;
  }

  res.status(400).json({ error: 'Acción no válida' });
});

// CONTROLS
app.get('/api/controls', authenticateToken, (req, res) => {
  prisma.control.findMany({ where: { companyId: req.user.companyId }, orderBy: { id: 'asc' } })
    .then((controls) => res.json(controls))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/api/controls', authenticateToken, (req, res) => {
  const { action } = req.query;
  
  if (action === 'seed') {
    const schema = z.object({
      initialControls: z.array(z.object({
        id: z.string(), norm: z.string(), name: z.string(), state: z.string(), ley: z.string(),
      })),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

    Promise.all(result.data.initialControls.map((ctrl) => 
      prisma.control.upsert({
        where: { id_companyId: { id: ctrl.id, companyId: req.user.companyId } },
        update: { state: ctrl.state },
        create: { id: ctrl.id, norm: ctrl.norm, name: ctrl.name, state: ctrl.state, ley: ctrl.ley, companyId: req.user.companyId },
      })
    )).then(() => res.json({ message: 'Controls seeded successfully' }))
      .catch((err) => res.status(500).json({ error: err.message }));
    return;
  }
  
  res.status(400).json({ error: 'Acción no válida' });
});

app.put('/api/controls', authenticateToken, (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  const schema = z.object({
    state: z.enum(['No iniciado', 'Implementado', 'En progreso', 'En curso', 'No implementado', 'Auditado', 'No aplicable']),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

  prisma.control.update({
    where: { id_companyId: { id, companyId: req.user.companyId } },
    data: { state: result.data.state },
  }).then((control) => res.json(control))
    .catch(() => res.status(404).json({ error: 'Control no encontrado' }));
});

// ADMIN USERS
app.get('/api/admin/users', authenticateToken, (req, res) => {
  prisma.user.findMany({
    where: { companyId: req.user.companyId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  }).then((users) => res.json(users))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/api/admin/users', authenticateToken, (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.enum(['ADMIN', 'USER']),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

  const { email, password, name, role } = result.data;
  
  prisma.user.findUnique({ where: { email_companyId: { email, companyId: req.user.companyId } } })
    .then(async (existing) => {
      if (existing) return res.status(400).json({ error: 'El email ya está registrado' });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, passwordHash, name, role, companyId: req.user.companyId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      res.json(user);
    }).catch((err) => res.status(500).json({ error: err.message }));
});

// RISKS
app.get('/api/risks', authenticateToken, (req, res) => {
  prisma.risk.findMany({ where: { companyId: req.user.companyId } })
    .then((risks) => res.json(risks))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/api/risks', authenticateToken, (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    impact: z.number().min(1).max(5),
    probability: z.number().min(1).max(5),
    plan: z.string().min(1),
    description: z.string().min(1),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

  prisma.risk.create({
    data: { ...result.data, companyId: req.user.companyId },
  }).then((risk) => res.json(risk))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// INCIDENTS
app.get('/api/incidents', authenticateToken, (req, res) => {
  prisma.incident.findMany({ 
    where: { companyId: req.user.companyId },
    include: { logs: true },
    orderBy: { date: 'desc' },
  }).then((incidents) => res.json(incidents))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/api/incidents', authenticateToken, (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    severity: z.enum(['Bajo', 'Medio', 'Alto', 'Crítico']),
    status: z.enum(['Nuevo', 'En Proceso', 'Resuelto', 'Cerrado']),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

  prisma.incident.create({
    data: { ...result.data, companyId: req.user.companyId },
  }).then((incident) => res.json(incident))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// DOCUMENTS
app.get('/api/documents', authenticateToken, (req, res) => {
  prisma.document.findMany({ where: { companyId: req.user.companyId } })
    .then((documents) => res.json(documents))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/api/documents', authenticateToken, (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    folder: z.string().min(1),
    size: z.string().min(1),
    author: z.string().min(1),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

  prisma.document.create({
    data: { ...result.data, companyId: req.user.companyId },
  }).then((doc) => res.json(doc))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// COMPANY
app.get('/api/company', authenticateToken, (req, res) => {
  prisma.company.findUnique({ where: { id: req.user.companyId } })
    .then((company) => res.json(company))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.put('/api/company', authenticateToken, (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    rut: z.string().min(1),
    legalContact: z.string().min(1),
    configured: z.boolean().optional(),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

  prisma.company.update({
    where: { id: req.user.companyId },
    data: result.data,
  }).then((company) => res.json(company))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// SUPERADMIN
app.get('/api/superadmin/companies', authenticateToken, (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acceso denegado' });
  
  prisma.company.findMany({ include: { users: true } })
    .then((companies) => res.json(companies))
    .catch((err) => res.status(500).json({ error: err.message }));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor API local corriendo en http://localhost:${PORT}`);
});
