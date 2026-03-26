import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  companyName: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  companyName: z.string().min(2, 'Nombre de empresa debe tener al menos 2 caracteres'),
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  role: z.enum(['ADMIN', 'USER']),
});

export const createRiskSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  impact: z.number().min(1).max(5),
  probability: z.number().min(1).max(5),
  plan: z.string().min(1, 'Plan requerido'),
  description: z.string().min(1, 'Descripción requerida'),
});

export const createIncidentSchema = z.object({
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

export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.string().min(1, 'Tipo requerido'),
  folder: z.string().min(1, 'Carpeta requerida'),
  size: z.string().min(1, 'Tamaño requerido'),
  author: z.string().min(1, 'Autor requerido'),
});

export const updateControlSchema = z.object({
  state: z.enum(['No iniciado', 'Implementado', 'En progreso', 'En curso', 'No implementado', 'Auditado', 'No aplicable']),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1),
  rut: z.string().min(1),
  legalContact: z.string().min(1),
  configured: z.boolean().optional(),
});

export const createSuperAdminCompanySchema = z.object({
  companyName: z.string().min(2),
  rut: z.string().optional(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  adminName: z.string().min(2),
});
