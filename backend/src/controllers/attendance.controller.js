const { PrismaClient } = require('@prisma/client');
const { createError } = require('../middlewares/errorHandler.middleware');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ============================================================
// CHECK-IN POR QR CODE
// ============================================================
const checkIn = async (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode) throw createError('QR Code não informado.', 400);

  // Buscar inscrição pelo QR Code
  const registration = await prisma.registration.findUnique({
    where: { qrCode },
    include: {
      user: { select: { id: true, name: true, email: true, course: true } },
      event: { select: { id: true, title: true, startDate: true, endDate: true } },
      attendance: true,
    },
  });

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'QR Code inválido. Inscrição não encontrada.',
    });
  }

  if (registration.status !== 'CONFIRMED') {
    return res.status(400).json({
      success: false,
      message: `Inscrição ${registration.status === 'CANCELLED' ? 'cancelada' : 'não confirmada'}.`,
    });
  }

  // Verificar se já fez check-in
  if (registration.attendance) {
    return res.status(409).json({
      success: false,
      message: 'Check-in já realizado anteriormente.',
      data: {
        participant: registration.user.name,
        event: registration.event.title,
        checkedInAt: registration.attendance.checkedInAt,
      },
    });
  }

  // Registrar presença
  const attendance = await prisma.attendance.create({
    data: {
      registrationId: registration.id,
      userId: registration.userId,
      method: 'QR_CODE',
      checkedInBy: req.user?.id || null,
    },
  });

  logger.info(`Check-in: ${registration.user.email} no evento "${registration.event.title}"`);

  res.json({
    success: true,
    message: `✅ Check-in realizado! Bem-vindo(a), ${registration.user.name}!`,
    data: {
      participant: {
        name: registration.user.name,
        email: registration.user.email,
        course: registration.user.course,
      },
      event: registration.event.title,
      checkedInAt: attendance.checkedInAt,
    },
  });
};

// ============================================================
// CHECK-IN MANUAL (por nome ou email)
// ============================================================
const manualCheckIn = async (req, res) => {
  const { registrationId } = req.body;

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { id: true, title: true } },
      attendance: true,
    },
  });

  if (!registration) throw createError('Inscrição não encontrada.', 404);
  if (registration.attendance) throw createError('Presença já registrada.', 409);

  // Verificar permissão
  const event = await prisma.event.findUnique({ where: { id: registration.eventId } });
  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão para registrar presença neste evento.', 403);
  }

  const attendance = await prisma.attendance.create({
    data: {
      registrationId: registration.id,
      userId: registration.userId,
      method: 'MANUAL',
      checkedInBy: req.user.id,
    },
  });

  res.json({
    success: true,
    message: 'Presença registrada manualmente.',
    data: attendance,
  });
};

// ============================================================
// LISTA DE PRESENÇA DO EVENTO
// ============================================================
const getEventAttendance = async (req, res) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Evento não encontrado.', 404);

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão para visualizar a lista de presença.', 403);
  }

  const [attendances, total, confirmed] = await Promise.all([
    prisma.attendance.findMany({
      where: { registration: { eventId } },
      include: {
        user: { select: { name: true, email: true, course: true, cpf: true } },
        registration: { select: { participantName: true, participantCourse: true } },
      },
      orderBy: { checkedInAt: 'asc' },
    }),
    prisma.registration.count({ where: { eventId, status: 'CONFIRMED' } }),
    prisma.attendance.count({ where: { registration: { eventId } } }),
  ]);

  res.json({
    success: true,
    data: attendances,
    stats: {
      totalRegistered: total,
      totalPresent: confirmed,
      attendanceRate: total > 0 ? ((confirmed / total) * 100).toFixed(1) : 0,
    },
  });
};

module.exports = { checkIn, manualCheckIn, getEventAttendance };
