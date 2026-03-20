import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Middleware: Verify Company Context ---
const getCompanyId = (req: express.Request) => req.headers['x-company-id'] as string;

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password, companyName } = req.body;
  
  // Special handling for SUPER_ADMIN (they might log in without a company context or to a specific 'System' company)
  const user = await prisma.user.findFirst({
    where: { 
      email, 
      password,
      ...(companyName ? { company: { name: companyName } } : {})
    },
    include: { company: true }
  });

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  res.json({ 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    role: user.role, 
    company: user.company 
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, companyName } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let company = await tx.company.findUnique({ where: { name: companyName } });
      if (!company) {
        company = await tx.company.create({
          data: { name: companyName, rut: 'Sin RUT', legalContact: name, configured: false }
        });
      }

      const user = await tx.user.create({
        data: { email, password, name, role: 'ADMIN', companyId: company.id },
        include: { company: true }
      });

      return user;
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: 'Error en el registro.' });
  }
});

app.post('/api/auth/setup-superadmin', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const systemCompany = await prisma.company.upsert({
      where: { name: 'SISTEMA' },
      update: {},
      create: { name: 'SISTEMA', rut: '0-0', legalContact: 'ROOT', configured: true }
    });

    const user = await prisma.user.create({
      data: { email, password, name, role: 'SUPER_ADMIN', companyId: systemCompany.id },
      include: { company: true }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'SuperAdmin already exists or error occurs.' });
  }
});

// --- SuperAdmin Module ---
app.get('/api/superadmin/companies', async (req, res) => {
  const companies = await prisma.company.findMany({
    where: { NOT: { name: 'SISTEMA' } },
    include: { users: { where: { role: 'ADMIN' } } }
  });
  res.json(companies);
});

app.post('/api/superadmin/companies', async (req, res) => {
  const { companyName, rut, adminEmail, adminPassword, adminName } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName, rut: rut || 'Sin RUT', legalContact: adminName, configured: false }
      });
      const user = await tx.user.create({
        data: { email: adminEmail, password: adminPassword, name: adminName, role: 'ADMIN', companyId: company.id }
      });
      return { company, user };
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Error creando empresa y administrador.' });
  }
});

// --- Admin Module: List Users per Company ---
app.get('/api/admin/users', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  res.json(users);
});

app.post('/api/admin/users', async (req, res) => {
  const companyId = getCompanyId(req);
  const { email, password, name, role } = req.body;
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const user = await prisma.user.create({
    data: { email, password, name, role, companyId }
  });
  res.json(user);
});

// --- Standard Resource Routes (Filtered by companyId) ---
app.get('/api/company', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  res.json(company || {});
});

app.post('/api/company', async (req, res) => {
  const companyId = getCompanyId(req);
  const { name, rut, legalContact, configured } = req.body;
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const updated = await prisma.company.update({ where: { id: companyId }, data: { name, rut, legalContact, configured } });
  res.json(updated);
});

app.get('/api/controls', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const controls = await prisma.control.findMany({ where: { companyId }, orderBy: { id: 'asc' } });
  res.json(controls);
});

app.put('/api/controls/:id', async (req, res) => {
  const companyId = getCompanyId(req);
  const { id } = req.params;
  const { state } = req.body;
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const updated = await prisma.control.update({ where: { id_companyId: { id, companyId } }, data: { state } });
  res.json(updated);
});

app.post('/api/controls/seed', async (req, res) => {
  const companyId = getCompanyId(req);
  const { initialControls } = req.body;
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  for (const ctrl of initialControls) {
    await prisma.control.upsert({
      where: { id_companyId: { id: ctrl.id, companyId } },
      update: { state: ctrl.state },
      create: { id: ctrl.id, norm: ctrl.norm, name: ctrl.name, state: ctrl.state, ley: ctrl.ley, companyId }
    });
  }
  res.json({ message: 'Controls seeded successfully' });
});

app.get('/api/risks', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const risks = await prisma.risk.findMany({ where: { companyId } });
  res.json(risks);
});

app.post('/api/risks', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const risk = await prisma.risk.create({ data: { ...req.body, companyId } });
  res.json(risk);
});

app.get('/api/incidents', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const incidents = await prisma.incident.findMany({ where: { companyId }, include: { logs: true }, orderBy: { date: 'desc' } });
  res.json(incidents);
});

app.post('/api/incidents', async (req, res) => {
  const companyId = getCompanyId(req);
  const { title, description, severity, status, legalCountdown, logs } = req.body;
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const incident = await prisma.incident.create({
    data: { title, description, severity, status, legalCountdown, companyId,
      logs: { create: logs.map((log: any) => ({ action: log.action, user: log.user, date: new Date(log.date) })) }
    },
    include: { logs: true }
  });
  res.json(incident);
});

app.get('/api/documents', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const docs = await prisma.document.findMany({ where: { companyId }, orderBy: { date: 'desc' } });
  res.json(docs);
});

app.post('/api/documents', async (req, res) => {
  const companyId = getCompanyId(req);
  const { name, type, folder, size, author } = req.body;
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });
  const doc = await prisma.document.create({ data: { name, type, folder, size, author, companyId } });
  res.json(doc);
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
