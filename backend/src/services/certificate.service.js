const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const CERT_DIR = path.join(__dirname, '..', '..', 'certificates');
if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });

/**
 * Gera código único de autenticação do certificado
 * Formato: UFRA-AAAA-XXXXX
 */
const generateCertCode = (year) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `UFRA-${year}-${code}`;
};

/**
 * Gera o certificado PDF e salva no banco de dados
 */
const generateCertificate = async (registration, event) => {
  const year = new Date().getFullYear();
  let certCode;
  
  // Garantir código único
  let attempts = 0;
  do {
    certCode = generateCertCode(year);
    const exists = await prisma.certificate.findUnique({ where: { code: certCode } });
    if (!exists) break;
    attempts++;
    if (attempts > 10) throw new Error('Não foi possível gerar código único');
  } while (true);

  const pdfFilename = `${certCode}.pdf`;
  const pdfPath = path.join(CERT_DIR, pdfFilename);
  const validationUrl = `${process.env.CERT_VALIDATION_URL || 'http://localhost:3000/certificados/validar'}/${certCode}`;

  // Gerar QR Code como buffer
  const qrBuffer = await QRCode.toBuffer(validationUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 120,
    margin: 1,
    color: { dark: '#1B5E20', light: '#FFFFFF' },
  });

  // =========================================================
  // GERAR PDF DO CERTIFICADO
  // =========================================================
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const W = doc.page.width;  // 841.89
    const H = doc.page.height; // 595.28

    // --- Fundo ---
    doc.rect(0, 0, W, H).fill('#F8FAF8');

    // --- Borda principal (verde UFRA) ---
    doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke('#1B5E20');
    doc.rect(26, 26, W - 52, H - 52).lineWidth(1).stroke('#F9A825');

    // --- Cabeçalho: faixa verde ---
    doc.rect(20, 20, W - 40, 100).fill('#1B5E20');

    // --- Título da instituição ---
    doc.fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('UNIVERSIDADE FEDERAL RURAL DA AMAZÔNIA', 0, 38, { align: 'center' });

    doc.fillColor('#F9A825')
      .font('Helvetica')
      .fontSize(9)
      .text('CAMPUS PARAGOMINAS', 0, 56, { align: 'center' });

    doc.fillColor('#FFFFFF')
      .font('Helvetica')
      .fontSize(8)
      .text('Rodovia PA-256, Km 02, s/n – Abelha, Paragominas – PA', 0, 74, { align: 'center' });

    // --- Título CERTIFICADO ---
    doc.fillColor('#1B5E20')
      .font('Helvetica-Bold')
      .fontSize(36)
      .text('CERTIFICADO', 0, 145, { align: 'center', characterSpacing: 8 });

    doc.fillColor('#F9A825')
      .font('Helvetica')
      .fontSize(12)
      .text('DE PARTICIPAÇÃO', 0, 187, { align: 'center', characterSpacing: 3 });

    // --- Linha decorativa ---
    doc.moveTo(W / 2 - 150, 210).lineTo(W / 2 + 150, 210).lineWidth(1).stroke('#F9A825');

    // --- Texto principal ---
    doc.fillColor('#333333')
      .font('Helvetica')
      .fontSize(13)
      .text('Certificamos que', 0, 230, { align: 'center' });

    // --- Nome do participante ---
    doc.fillColor('#1B5E20')
      .font('Helvetica-Bold')
      .fontSize(26)
      .text(registration.user.name, 80, 255, { align: 'center', width: W - 160 });

    // --- Texto do certificado ---
    const startDateFormatted = new Date(event.startDate).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    const endDateFormatted = new Date(event.endDate).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    doc.fillColor('#444444')
      .font('Helvetica')
      .fontSize(12)
      .text(
        `participou do evento "${event.title}", realizado no período de ${startDateFormatted} a ${endDateFormatted},` +
        ` com carga horária total de ${event.workload} (${event.workload === 1 ? 'uma hora' : `${event.workload} horas`}).`,
        80, 300, {
          align: 'center',
          width: W - 160,
          lineGap: 4,
        }
      );

    // --- Local e data de emissão ---
    const issuedDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    doc.fillColor('#555555')
      .font('Helvetica')
      .fontSize(10)
      .text(`Paragominas – PA, ${issuedDate}`, 0, 375, { align: 'center' });

    // --- Linha de assinatura ---
    const sigLineY = 430;
    doc.moveTo(W / 2 - 100, sigLineY).lineTo(W / 2 + 100, sigLineY).lineWidth(1).stroke('#333333');
    doc.fillColor('#333333')
      .font('Helvetica')
      .fontSize(9)
      .text('Direção do Campus Paragominas – UFRA', 0, sigLineY + 8, { align: 'center' });

    // --- QR Code (canto inferior direito) ---
    doc.image(qrBuffer, W - 160, H - 180, { width: 100 });
    doc.fillColor('#888888')
      .font('Helvetica')
      .fontSize(7)
      .text('Escaneie para validar', W - 175, H - 80, { width: 130, align: 'center' });

    // --- Código de autenticação ---
    doc.rect(W - 195, H - 65, 155, 22).fill('#F0F7F0');
    doc.fillColor('#1B5E20')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(certCode, W - 195, H - 60, { width: 155, align: 'center' });

    // --- Rodapé ---
    doc.fillColor('#999999')
      .font('Helvetica')
      .fontSize(7)
      .text(`Este certificado pode ser verificado em: ${validationUrl}`, 30, H - 38, {
        width: W - 220,
        align: 'left',
      });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // =========================================================
  // SALVAR NO BANCO DE DADOS
  // =========================================================
  const certificate = await prisma.certificate.create({
    data: {
      code: certCode,
      pdfPath,
      qrCodeImage: null,
      userId: registration.userId,
      eventId: event.id,
      registrationId: registration.id,
      participantName: registration.user.name,
      eventTitle: event.title,
      workload: event.workload,
      eventStartDate: event.startDate,
      eventEndDate: event.endDate,
    },
  });

  // Notificação para o participante
  await prisma.notification.create({
    data: {
      userId: registration.userId,
      title: '🎓 Seu certificado está disponível!',
      message: `O certificado do evento "${event.title}" foi gerado. Acesse seu painel para baixar.`,
      type: 'CERTIFICATE',
      link: '/participante/certificados',
    },
  });

  logger.info(`Certificado gerado: ${certCode} para ${registration.user.name}`);

  return certificate;
};

module.exports = { generateCertificate };
