import { Resend } from 'resend';

const FROM_EMAIL = 'onboarding@resend.dev';
const FRONTEND_URL = 'https://vcisosgci.vercel.app';
const ADMIN_EMAIL = 'josemiguel.mv@icloud.com';

const WELCOME_HTML = (name: string, companyName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0A0F1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800;">¡Bienvenido a vCISO!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Tu plataforma de gestión de cumplimiento y seguridad</p>
    </div>
    
    <div style="background-color: #111827; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6;">
        Hola <strong style="color: #10B981;">${name}</strong>,
      </p>
      
      <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin-top: 20px;">
        Te damos la bienvenida a <strong style="color: #10B981;">vCISO</strong>, la plataforma SaaS de gestión de cumplimiento de seguridad de la información.
      </p>
      
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #10B981; margin: 0 0 16px; font-size: 16px;">📋 ¿Qué puedes hacer con vCISO?</h3>
        <ul style="color: #D1D5DB; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
          <li><strong>Evaluar</strong> tus controles ISO 27001:2022</li>
          <li><strong>Gestionar</strong> riesgos de seguridad</li>
          <li><strong>Documentar</strong> incidentes con plazos legales</li>
          <li><strong>Cumplir</strong> las leyes chilenas 19.628 y 21.459</li>
          <li><strong>Generar</strong> reportes SoA (Statement of Applicability)</li>
        </ul>
      </div>
      
      <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6;">
        Tu empresa <strong style="color: #10B981;">${companyName}</strong> ya está configurada con 195 controles de seguridad listos para evaluar.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Ir a mi Dashboard →
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;">
      
      <p style="color: #6B7280; font-size: 12px; line-height: 1.6;">
        Este es un correo automático de <strong>vCISO</strong>. Si no realizaste este registro, ignora este mensaje o contacta a soporte.
      </p>
      
      <p style="color: #6B7280; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} vCISO - Gestión de Cumplimiento de Seguridad
      </p>
    </div>
  </div>
</body>
</html>
`;

const ADMIN_NOTIFICATION_HTML = (userName: string, userEmail: string, companyName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0A0F1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">🆕 Nuevo Registro en vCISO</h1>
    </div>
    
    <div style="background-color: #111827; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #E5E7EB; font-size: 14px; line-height: 1.6;">
        Se ha registrado un nuevo usuario en <strong style="color: #3B82F6;">vCISO</strong>.
      </p>
      
      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table style="width: 100%; color: #D1D5DB; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #9CA3AF;">Nombre:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #3B82F6;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9CA3AF;">Email:</td>
            <td style="padding: 8px 0; font-weight: bold;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9CA3AF;">Empresa:</td>
            <td style="padding: 8px 0; font-weight: bold;">${companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9CA3AF;">Fecha:</td>
            <td style="padding: 8px 0;">${new Date().toLocaleString('es-CL')}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6;">
        Puedes usar esta información para contactar al nuevo usuario y ofrecer soporte o seguimiento comercial.
      </p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${FRONTEND_URL}/superadmin" style="display: inline-block; background: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Ver en Panel de Administración →
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;">
      
      <p style="color: #6B7280; font-size: 11px;">
        Este es un correo automático del sistema vCISO.
      </p>
    </div>
  </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (email: string, name: string, companyName: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log('RESEND_API_KEY not configured');
    return;
  }

  try {
    const resend = new Resend(apiKey);

    const [welcomeResult, adminResult] = await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '¡Bienvenido a vCISO! - Tu plataforma de cumplimiento de seguridad',
        html: WELCOME_HTML(name, companyName),
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🆕 Nuevo registro: ${name} - ${companyName}`,
        html: ADMIN_NOTIFICATION_HTML(name, email, companyName),
      })
    ]);

    console.log('Welcome email sent to:', email, 'ID:', welcomeResult.data?.id);
    console.log('Admin notification sent, ID:', adminResult.data?.id);
  } catch (err) {
    console.error('Email error:', err);
  }
};
