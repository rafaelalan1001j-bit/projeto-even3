const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Cria o transporter do Nodemailer
 * Usa Ethereal para desenvolvimento (emails de teste gratuitos)
 */
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'seu_usuario_ethereal@ethereal.email') {
    // Usar configuração de produção
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Criar conta Ethereal para testes (gratuito)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info(`📧 Email de teste - Login: ${testAccount.user} | Senha: ${testAccount.pass}`);
    logger.info(`📧 Ver emails enviados em: https://ethereal.email/messages`);
  }

  return transporter;
};

/**
 * Template base HTML dos emails
 */
const emailTemplate = (content) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #333; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; font-weight: 700; }
    .header p { color: #A5D6A7; font-size: 13px; margin-top: 6px; }
    .accent-bar { height: 4px; background: linear-gradient(90deg, #F9A825, #FFD54F); }
    .content { padding: 32px 24px; }
    .btn { display: inline-block; padding: 14px 28px; background: #1B5E20; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 20px; }
    .info-box { background: #F1F8E9; border-left: 4px solid #1B5E20; padding: 16px; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; background: #F5F5F5; color: #999; font-size: 12px; }
    h2 { color: #1B5E20; font-size: 18px; margin-bottom: 12px; }
    p { line-height: 1.6; margin-bottom: 10px; color: #555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 UFRA Eventos</h1>
      <p>Universidade Federal Rural da Amazônia – Campus Paragominas</p>
    </div>
    <div class="accent-bar"></div>
    <div class="content">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} UFRA Campus Paragominas. Todos os direitos reservados.</p>
      <p>Rodovia PA-256, Km 02 – Paragominas, PA</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Envia email de boas-vindas
 */
const sendWelcomeEmail = async (user) => {
  const transport = await getTransporter();
  
  const html = emailTemplate(`
    <h2>Bem-vindo(a), ${user.name}! 🎉</h2>
    <p>Sua conta na plataforma <strong>UFRA Eventos</strong> foi criada com sucesso.</p>
    <p>Agora você pode:</p>
    <ul style="margin: 10px 0 10px 20px; color: #555;">
      <li>Explorar e inscrever-se em eventos acadêmicos</li>
      <li>Baixar seus certificados de participação</li>
      <li>Submeter trabalhos científicos</li>
    </ul>
    <a href="${process.env.FRONTEND_URL}" class="btn">Acessar a Plataforma</a>
  `);

  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'UFRA Eventos <noreply@ufra.edu.br>',
    to: user.email,
    subject: '🎓 Bem-vindo à UFRA Eventos!',
    html,
  });

  logger.info(`Email de boas-vindas enviado para ${user.email} | Preview: ${nodemailer.getTestMessageUrl(info)}`);
  return info;
};

/**
 * Envia confirmação de inscrição com QR Code
 */
const sendRegistrationConfirmation = async (user, event, registration) => {
  const transport = await getTransporter();

  const eventDate = new Date(event.startDate).toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = emailTemplate(`
    <h2>Inscrição Confirmada! ✅</h2>
    <p>Olá, <strong>${user.name}</strong>!</p>
    <p>Sua inscrição no evento abaixo foi confirmada com sucesso.</p>
    
    <div class="info-box">
      <strong style="color: #1B5E20; font-size: 16px;">${event.title}</strong><br>
      <p style="margin-top: 8px;">📅 <strong>Data:</strong> ${eventDate}</p>
      <p>📍 <strong>Local:</strong> ${event.location}</p>
      <p>⏱️ <strong>Carga Horária:</strong> ${event.workload}h</p>
    </div>

    <p><strong>Seu código de inscrição:</strong></p>
    <div style="background: #1B5E20; color: #fff; padding: 12px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 18px; letter-spacing: 3px; margin: 10px 0;">
      ${registration.qrCode.substring(0, 8).toUpperCase()}
    </div>

    <p>Apresente seu <strong>QR Code</strong> no dia do evento para fazer o check-in. Acesse seu painel para visualizá-lo.</p>

    <a href="${process.env.FRONTEND_URL}/participante" class="btn">Ver Minha Inscrição</a>
  `);

  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'UFRA Eventos <noreply@ufra.edu.br>',
    to: user.email,
    subject: `✅ Inscrição confirmada: ${event.title}`,
    html,
  });

  logger.info(`Email de confirmação enviado para ${user.email} | Preview: ${nodemailer.getTestMessageUrl(info)}`);
  return info;
};

/**
 * Envia link de reset de senha
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const transport = await getTransporter();

  const html = emailTemplate(`
    <h2>Redefinição de Senha 🔑</h2>
    <p>Olá, <strong>${user.name}</strong>!</p>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta UFRA Eventos.</p>
    <p>Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.</p>
    
    <a href="${resetUrl}" class="btn">Redefinir Minha Senha</a>
    
    <p style="margin-top: 20px; color: #999; font-size: 12px;">Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanecerá a mesma.</p>
  `);

  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'UFRA Eventos <noreply@ufra.edu.br>',
    to: user.email,
    subject: '🔑 Redefinição de senha – UFRA Eventos',
    html,
  });

  logger.info(`Email de reset enviado para ${user.email} | Preview: ${nodemailer.getTestMessageUrl(info)}`);
  return info;
};

module.exports = { sendWelcomeEmail, sendRegistrationConfirmation, sendPasswordResetEmail };
