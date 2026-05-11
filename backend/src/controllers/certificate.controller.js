const { PrismaClient } = require('@prisma/client');
const { createError } = require('../middlewares/errorHandler.middleware');
const certificateService = require('../services/certificate.service');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ============================================================
// GERAR CERTIFICADOS PARA TODOS OS PARTICIPANTES DE UM EVENTO
// ============================================================
const generateEventCertificates = async (req, res) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true },
  });

  if (!event) throw createError('Evento não encontrado.', 404);

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Você não tem permissão para gerar certificados deste evento.', 403);
  }

  if (event.status !== 'FINISHED') {
    throw createError('Só é possível gerar certificados de eventos finalizados.', 400);
  }

  // Buscar inscrições com presença confirmada e sem certificado
  const registrations = await prisma.registration.findMany({
    where: {
      eventId,
      status: 'CONFIRMED',
      attendance: { isNot: null },
      certificate: null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (registrations.length === 0) {
    return res.json({
      success: true,
      message: 'Nenhum participante elegível para certificado (necessário check-in).',
      data: { generated: 0 },
    });
  }

  let generated = 0;
  const errors = [];

  for (const registration of registrations) {
    try {
      await certificateService.generateCertificate(registration, event);
      generated++;
    } catch (err) {
      errors.push({ registrationId: registration.id, error: err.message });
      logger.error(`Erro ao gerar certificado para ${registration.user.email}: ${err.message}`);
    }
  }

  logger.info(`${generated} certificados gerados para o evento "${event.title}"`);

  res.json({
    success: true,
    message: `${generated} certificado(s) gerado(s) com sucesso!`,
    data: { generated, errors: errors.length > 0 ? errors : undefined },
  });
};

// ============================================================
// BAIXAR CERTIFICADO (participante)
// ============================================================
const downloadCertificate = async (req, res) => {
  const { id } = req.params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!certificate) throw createError('Certificado não encontrado.', 404);

  // Apenas o dono ou admin pode baixar
  if (certificate.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Acesso não autorizado.', 403);
  }

  if (!certificate.pdfPath) {
    throw createError('Arquivo do certificado não disponível.', 404);
  }

  // Incrementar contador de downloads
  await prisma.certificate.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });

  res.download(certificate.pdfPath, `certificado-${certificate.code}.pdf`);
};

// ============================================================
// VALIDAR CERTIFICADO (público)
// ============================================================
const validateCertificate = async (req, res) => {
  const { code } = req.params;

  const certificate = await prisma.certificate.findUnique({
    where: { code },
    select: {
      id: true, code: true, issuedAt: true, isValid: true,
      participantName: true, eventTitle: true,
      workload: true, eventStartDate: true, eventEndDate: true,
      downloadCount: true,
      user: { select: { name: true, institution: true } },
      event: { select: { slug: true, location: true } },
    },
  });

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificado não encontrado. Verifique o código informado.',
    });
  }

  res.json({
    success: true,
    message: certificate.isValid
      ? 'Certificado válido e autêntico.'
      : 'Certificado inválido ou revogado.',
    data: certificate,
  });
};

// ============================================================
// MEUS CERTIFICADOS (participante)
// ============================================================
const getMyCertificates = async (req, res) => {
  const certificates = await prisma.certificate.findMany({
    where: { userId: req.user.id },
    include: {
      event: { select: { id: true, title: true, slug: true, banner: true, category: true } },
    },
    orderBy: { issuedAt: 'desc' },
  });

  res.json({ success: true, data: certificates });
};

module.exports = {
  generateEventCertificates,
  downloadCertificate,
  validateCertificate,
  getMyCertificates,
};
