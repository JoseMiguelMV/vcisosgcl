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

// --- Company Routes ---
app.get('/api/company', async (req, res) => {
  const company = await prisma.company.findFirst();
  res.json(company || {});
});

app.post('/api/company', async (req, res) => {
  const { name, rut, legalContact, configured } = req.body;
  const existing = await prisma.company.findFirst();
  if (existing) {
    const updated = await prisma.company.update({
      where: { id: existing.id },
      data: { name, rut, legalContact, configured }
    });
    return res.json(updated);
  }
  const created = await prisma.company.create({
    data: { name, rut, legalContact, configured }
  });
  res.json(created);
});

// --- Controls Routes ---
app.get('/api/controls', async (req, res) => {
  const controls = await prisma.control.findMany({ orderBy: { id: 'asc' } });
  res.json(controls);
});

app.put('/api/controls/:id', async (req, res) => {
  const { id } = req.params;
  const { state } = req.body;
  const updated = await prisma.control.update({
    where: { id },
    data: { state }
  });
  res.json(updated);
});

// Seed Initial Controls (Internal endpoint)
app.post('/api/controls/seed', async (req, res) => {
  const { initialControls } = req.body;
  for (const ctrl of initialControls) {
    await prisma.control.upsert({
      where: { id: ctrl.id },
      update: { state: ctrl.state },
      create: { 
        id: ctrl.id, 
        norm: ctrl.norm, 
        name: ctrl.name, 
        state: ctrl.state, 
        ley: ctrl.ley 
      }
    });
  }
  res.json({ message: 'Controls seeded successfully' });
});

// --- Risks Routes ---
app.get('/api/risks', async (req, res) => {
  const risks = await prisma.risk.findMany();
  res.json(risks);
});

app.post('/api/risks', async (req, res) => {
  const risk = await prisma.risk.create({ data: req.body });
  res.json(risk);
});

// --- Incidents Routes ---
app.get('/api/incidents', async (req, res) => {
  const incidents = await prisma.incident.findMany({
    include: { logs: true },
    orderBy: { date: 'desc' }
  });
  res.json(incidents);
});

app.post('/api/incidents', async (req, res) => {
  const { title, description, severity, status, legalCountdown, logs } = req.body;
  const incident = await prisma.incident.create({
    data: {
      title,
      description,
      severity,
      status,
      legalCountdown,
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
  const docs = await prisma.document.findMany({ orderBy: { date: 'desc' } });
  res.json(docs);
});

app.post('/api/documents', async (req, res) => {
  const { name, type, folder, size, author } = req.body;
  const doc = await prisma.document.create({
    data: { name, type, folder, size, author }
  });
  res.json(doc);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
