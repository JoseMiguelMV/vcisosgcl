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

// --- Middleware: Verify Company Context (Simplified for Dev) ---
// In a real app, use JWT. Here we'll expect x-company-id header.
const getCompanyId = (req: express.Request) => req.headers['x-company-id'] as string;

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password, companyName } = req.body;
  
  const user = await prisma.user.findFirst({
    where: { 
      email, 
      password, // In production, use bcrypt
      company: { name: companyName } 
    },
    include: { company: true }
  });

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas o empresa no encontrada' });
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
          data: { 
            name: companyName, 
            rut: 'Sin RUT', 
            legalContact: name, 
            configured: false 
          }
        });
      }

      const user = await tx.user.create({
        data: {
          email,
          password,
          name,
          role: 'ADMIN',
          companyId: company.id
        },
        include: { company: true }
      });

      return user;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: 'El usuario ya existe o hubo un error al crear la empresa.' });
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

// --- Company Routes ---
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

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { name, rut, legalContact, configured }
  });
  res.json(updated);
});

// --- Controls Routes ---
app.get('/api/controls', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const controls = await prisma.control.findMany({ 
    where: { companyId },
    orderBy: { id: 'asc' } 
  });
  res.json(controls);
});

app.put('/api/controls/:id', async (req, res) => {
  const companyId = getCompanyId(req);
  const { id } = req.params;
  const { state } = req.body;

  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const updated = await prisma.control.update({
    where: { id_companyId: { id, companyId } },
    data: { state }
  });
  res.json(updated);
});

// Seed Initial Controls for a specific company
app.post('/api/controls/seed', async (req, res) => {
  const companyId = getCompanyId(req);
  const { initialControls } = req.body;

  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  for (const ctrl of initialControls) {
    await prisma.control.upsert({
      where: { id_companyId: { id: ctrl.id, companyId } },
      update: { state: ctrl.state },
      create: { 
        id: ctrl.id, 
        norm: ctrl.norm, 
        name: ctrl.name, 
        state: ctrl.state, 
        ley: ctrl.ley,
        companyId
      }
    });
  }
  res.json({ message: 'Controls seeded correctly for the company' });
});

// --- Risks Routes ---
app.get('/api/risks', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const risks = await prisma.risk.findMany({ where: { companyId } });
  res.json(risks);
});

app.post('/api/risks', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const risk = await prisma.risk.create({ 
    data: { ...req.body, companyId } 
  });
  res.json(risk);
});

// --- Incidents Routes ---
app.get('/api/incidents', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const incidents = await prisma.incident.findMany({
    where: { companyId },
    include: { logs: true },
    orderBy: { date: 'desc' }
  });
  res.json(incidents);
});

app.post('/api/incidents', async (req, res) => {
  const companyId = getCompanyId(req);
  const { title, description, severity, status, legalCountdown, logs } = req.body;

  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const incident = await prisma.incident.create({
    data: {
      title,
      description,
      severity,
      status,
      legalCountdown,
      companyId,
      logs: {
        create: logs.map((log: any) => ({
          action: log.action,
          user: log.user,
          date: new Date(log.date)
        }))
      }
    },
    include: { logs: true }
  });
  res.json(incident);
});

app.post('/api/incidents/:id/logs', async (req, res) => {
  const { id } = req.params;
  const { action, user } = req.body;
  const log = await prisma.incidentLog.create({
    data: {
      action,
      user,
      incidentId: id
    }
  });
  res.json(log);
});

app.put('/api/incidents/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, action, user } = req.body;
  const updated = await prisma.incident.update({
    where: { id },
    data: {
      status,
      logs: {
        create: { action, user }
      }
    },
    include: { logs: true }
  });
  res.json(updated);
});

// --- Documents Routes ---
app.get('/api/documents', async (req, res) => {
  const companyId = getCompanyId(req);
  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const docs = await prisma.document.findMany({ 
    where: { companyId },
    orderBy: { date: 'desc' } 
  });
  res.json(docs);
});

app.post('/api/documents', async (req, res) => {
  const companyId = getCompanyId(req);
  const { name, type, folder, size, author } = req.body;

  if (!companyId) return res.status(400).json({ error: 'Falta ID de empresa' });

  const doc = await prisma.document.create({
    data: { name, type, folder, size, author, companyId }
  });
  res.json(doc);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
