const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { createError } = require('../middlewares/errorHandler.middleware');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const QR_DIR = path.join(__dirname, '..', '..', 'uploads', 'qrcodes');
if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });

// ============================================================
// INSCREVER-SE EM EVENTO
// ============================================================
const register = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  // Verificar se evento existe e está aberto
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } } },
  });

  if (!event) throw createError('Evento não encontrado.', 404);
  if (event.status !== 'PUBLISHED') throw createError('Este evento não está aceitando inscrições.', 400);

  // Prazo de inscrições
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    throw createError('O prazo de inscrições para este evento encerrou.', 400);
  }

  // Verificar se já está inscrito
  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) throw createError('Você já está inscrito neste evento.', 409);

  // Verificar vagas
  if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
    throw createError('Não há mais vagas disponíveis para este evento.', 400);
  }

  // Buscar dados do usuário para snapshot
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Gerar QR Code único
  const qrCodeData = uuidv4();
  const qrCodeImagePath = path.join(QR_DIR, `${qrCodeData}.png`);

  // Gerar imagem do QR Code
  const validationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkin/${qrCodeData}`;
  await QRCode.toFile(qrCodeImagePath, validationUrl, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
    color: { dark: '#1B5E20', light: '#FFFFFF' },
  });

  const registration = await prisma.registration.create({
    data: {
      id: uuidv4(),
      userId,
      eventId,
      qrCode: qrCodeData,
      qrCodeImage: `/uploads/qrcodes/${qrCodeData}.png`,
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      // Snapshot dos dados do participante
      participantName: user.name,
      participantEmail: user.email,
      participantCpf: user.cpf,
      participantPhone: user.phone,
      participantCourse: user.course,
      participantInstitution: user.institution,
    },
    include: {
      event: { select: { title: true, startDate: true, location: true } },
    },
  });

  // Criar notificação
  await prisma.notification.create({
    data: {
      userId,
      title: 'Inscrição confirmada!',
      message: `Sua inscrição no evento "${event.title}" foi confirmada.`,
      type: 'REGISTRATION',
      link: `/participante/inscricoes`,
    },
  });

  // Enviar email de confirmação
  emailService.sendRegistrationConfirmation(user, event, registration).catch(err =>
    logger.warn(`Falha ao enviar email de confirmação: ${err.message}`)
  );

  logger.info(`Inscrição: ${user.email} no evento "${event.title}"`);

  res.status(201).json({
    success: true,
    message: 'Inscrição realizada com sucesso!',
    data: registration,
  });
};

// ============================================================
// MINHAS INSCRIÇÕES
// ============================================================
const getMyRegistrations = async (req, res) => {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user.id },
    include: {
      event: {
        select: {
          id: true, title: true, slug: true, banner: true,
          startDate: true, endDate: true, location: true,
          workload: true, status: true,
          category: { select: { name: true, color: true } },
        },
      },
      attendance: { select: { checkedInAt: true } },
      certificate: { select: { id: true, code: true, issuedAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: registrations });
};

// ============================================================
// INSCRIÇÕES DE UM EVENTO (para organizador/admin)
// ============================================================
const getEventRegistrations = async (req, res) => {
  const { eventId } = req.params;
  const { page = 1, limit = 50, status, search } = req.query;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Evento não encontrado.', 404);

  // Verificar permissão
  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Acesso não autorizado.', 403);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    eventId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { participantName: { contains: search, mode: 'insensitive' } },
        { participantEmail: { contains: search, mode: 'insensitive' } },
        { participantCpf: { contains: search } },
      ],
    }),
  };

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: { select: { id: true, name: true, email: true, course: true } },
        attendance: { select: { checkedInAt: true } },
        certificate: { select: { code: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.registration.count({ where }),
  ]);

  res.json({
    success: true,
    data: registrations,
    pagination: {
      page: Number(page), limit: Number(limit), total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// ============================================================
// CANCELAR INSCRIÇÃO
// ============================================================
const cancelRegistration = async (req, res) => {
  const { id } = req.params;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { event: true },
  });

  if (!registration) throw createError('Inscrição não encontrada.', 404);

  if (registration.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Você não pode cancelar esta inscrição.', 403);
  }

  if (registration.status === 'CANCELLED') {
    throw createError('Esta inscrição já foi cancelada.', 400);
  }

  // Não permitir cancelamento após o evento começar
  if (new Date() > registration.event.startDate) {
    throw createError('Não é possível cancelar após o início do evento.', 400);
  }

  await prisma.registration.update({
    where: { id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  res.json({ success: true, message: 'Inscrição cancelada com sucesso.' });
};

module.exports = { register, getMyRegistrations, getEventRegistrations, cancelRegistration };
