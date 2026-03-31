# Guia de Usuario: vCISO SGCS

Sistema de Gestion de Cumplimiento Normativo y Ciberseguridad para empresas chilenas.

---

## 1. Primeros Pasos

### 1.1 Registro e Inicio de Sesion

1. Accede a la aplicacion en http://localhost:5173
2. Crea una cuenta haciendo clic en "Crear cuenta"
3. Ingresa tu nombre, nombre de la empresa, correo y contrasena
4. Al registrarte, se creara automaticamente tu empresa en el sistema
5. Recibiras tokens de acceso que validan tu sesion

### 1.2 Roles del Sistema

| Rol | Descripcion |
|-----|-------------|
| ADMIN | Administrador de empresa con acceso completo a los modulos |
| SUPER_ADMIN | Administrador del sistema con acceso a todas las empresas |

---

## 2. Modulos de la Aplicacion

### 2.1 Dashboard

Punto de entrada principal que muestra:

- **Indicadores de Cumplimiento**: Porcentajes ISO 27001 y NIST CSF
- **Incidentes Activos**: Numero de incidentes en curso
- **Controles Implementados**: Grafico de pastel con estados
- **Riesgos Criticos**: Cantidad de riesgos con score alto
- **Onboarding**: Si es la primera vez, mostrara un asistente para comenzar

El dashboard incluye graficos interactivos:
- Grafico radar por categorias de control
- Tendencia de cumplimiento
- Estadisticas por norma (ISO/NIST)
- Controles sin implementar

### 2.2 Mapa de Ruta (Roadmap)

Guia paso a paso para implementar el SGSI (Sistema de Gestion de Seguridad de la Informacion):

| Fase | Descripcion | Progreso |
|------|-------------|----------|
| Fase 1: Preparacion y Alcance | Configurar empresa, RUT, responsable legal | Automatica segun configuracion |
| Fase 2: Diagnostico y Riesgos | Crear matriz de riesgos 5x5 | Segun cantidad de riesgos creados |
| Fase 3: Controles Normativos | Implementar controles ISO 27001 | Segun % de cumplimiento |
| Fase 4: Operacion y Auditoria | Marcar controles como auditados, preparar SoA | Segun controles auditados |

### 2.3 Cumplimiento (Compliance)

Gestion de controles normativos con soporte para:

- **ISO 27001:2022** - Controles del Anexo A
- **NIST CSF 2.0** - Cybersecurity Framework
- **Ley 21.459** - Delitos informaticos (brechas de seguridad)
- **Ley 19.628** - Proteccion de datos personales (PDP)
- **Ley 20.393** - Responsabilidad penal personas juridicas

Funcionalidades:
- Buscar controles por ID, nombre o referencia legal
- Filtrar por estado (Implementado, En progreso, No iniciado, etc.)
- Expandir/Contraer filas para ver detalles
- Cambiar estado de cada control
- Exportar Statement of Applicability (SoA)
- Generar archivo Excel con todos los controles

Estados de control:
- **No iniciado**: Sin comenzar
- **En progreso**: En implementacion
- **Implementado**: Completamente implementado
- **Auditado**: Verificado por auditoria
- **No aplicable**: No aplica para la empresa

### 2.4 Incidentes

Gestion de incidentes de seguridad con plazos legales:

**Registrar Incidente:**
1. Clic en "Registrar Incidente"
2. Completar: Titulo, Descripcion, Severidad (Alta/Media/Baja)
3. El sistema calculara automaticamente el plazo legal

**Plazos Legales (Ley 21.459):**
- Incidentes de alta severidad: 3 dias habiles para notificar a la PDI
- El sistema muestra cuenta regresiva en tiempo real

**Seguimiento de Incidentes:**
- Ver detalle con linea de tiempo de acciones
- Agregar notas y acciones tomadas
- Cambiar estado (En progreso / Cerrado)

### 2.5 Riesgos

Gestion de riesgos mediante matriz 5x5:

**Crear Riesgo:**
- Titulo y descripcion
- Impacto (1-5)
- Probabilidad (1-5)
- Plan de tratamiento

**Calculo de Riesgo:**
- Riesgo = Impacto x Probabilidad
- Riesgos >= 20 se consideran criticos

### 2.6 Documentos

Gestor documental para evidencia del SGSI:

- Organizado por carpetas (Politicas, Procedimientos, Evidencia, etc.)
- Subir documentos con nombre, tipo y autor
- Fecha de carga automatica

### 2.7 Configuracion (Settings)

Personalizacion de la empresa:

**Datos de la Empresa:**
- Razon Social
- RUT
- Contacto Legal
- Color primario de marca
- Logo (URL o base64)

**Apariencia:**
- Cambio de tema (claro/oscuro)

### 2.8 Administracion

Gestion de usuarios de la empresa:

- Ver lista de usuarios
- Crear nuevos usuarios (analistas, auditores)
- Asignar roles

### 2.9 SuperAdmin

Panel de administracion global (solo para SUPER_ADMIN):

- Ver todas las empresas registradas
- Estadisticas generales
- Gestion centralizada

---

## 3. Normativas Soportadas

### 3.1 ISO 27001:2022

Sistema de Gestion de Seguridad de la Informacion (SGSI)

### 3.2 NIST CSF 2.0

Cybersecurity Framework con funciones:
- Govern (GV)
- Identify (ID)
- Protect (PR)
- Detect (DE)
- Respond (RS)
- Recover (RC)

### 3.3 Leyes Chilenas

| Ley | Tema | Plazo de notificacion |
|-----|------|----------------------|
| 21.459 | Delitos informaticos | 3 dias habiles (incidentes graves) |
| 19.628 | Proteccion datos personales | Segun regulations |
| 20.393 | Responsabilidad penal | N/A |

---

## 4. Estados de Cumplimiento

El sistema calcula automaticamente el porcentaje de cumplimiento basado en:

```
% Cumplimiento = (Controles Implementados + Auditados) / Total de Controles x 100
```

Niveles de riesgo por porcentaje:
- Verde: >= 80%
- Amarillo: 50-79%
- Rojo: < 50%

---

## 5. Flujo de Implementacion Recomendado

1. **Configurar empresa** (Settings) - 100% de Fase 1
2. **Cargar controles iniciales** - Sistema genera 93 controles ISO 27001
3. **Evaluar riesgos** (Risks) - Crear matriz 5x5
4. **Implementar controles** (Compliance) - Marcar estados
5. **Auditar y documentar** - Marcar como "Auditado"
6. **Exportar SoA** - Generar evidencia de cumplimiento

---

## 6. Preguntas Frecuentes

**P: Olvide mi contrasena**
R: Contacta al administrador del sistema

**P: No aparecen los controles**
R: Los controles se cargan automaticamente al crear tu empresa. Ve a Compliance y busca "Cargar Controles" o revisa que la empresa este configurada

**P: El plazo legal no aparece**
R: Solo incidentes de alta severidad generan plazo legal

---

*vcISO SGCS - Gestion de Riesgos y Cumplimiento Normativo*
