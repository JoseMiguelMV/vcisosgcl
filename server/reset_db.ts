import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Limpieza Profunda de Base de Datos vCISO SaaS ---');
  
  try {
    // Delete logs first (FKey to incident)
    console.log('1. Limpiando Bitácoras de Incidentes...');
    await prisma.incidentLog.deleteMany();

    console.log('2. Limpiando Incidentes Reportados...');
    await prisma.incident.deleteMany();

    console.log('3. Limpiando Registro de Riesgos...');
    await prisma.risk.deleteMany();

    console.log('4. Limpiando Repositorio de Documentos...');
    await prisma.document.deleteMany();

    console.log('5. Limpiando Matriz de Controles Normativos...');
    await prisma.control.deleteMany();

    console.log('6. Limpiando Cuentas de Usuarios...');
    await prisma.user.deleteMany();

    console.log('7. Limpiando Organizaciones / Empresas...');
    await prisma.company.deleteMany();
    
    console.log('\n--- 🚀 BASE DE DATOS RESETEADA CON ÉXITO ---');
    console.log('Ahora puede realizar el Setup de SuperAdmin desde la pantalla de Login.');
  } catch (error) {
    console.error('CRITICAL ERROR DURING RESET:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
