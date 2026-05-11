const { PrismaClient } = require('@prisma/client');
const { createError } = require('../middlewares/errorHandler.middleware');

const prisma = new PrismaClient();

// ============================================================
// ESTATÍSTICAS DO DASHBOARD ADMIN
// ============================================================
const getAdminStats = async (req, res) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalEvents, totalUsers, totalRegistrations, totalCertificates,
    totalSubmissions, upcomingEvents, eventsThisMonth,
    registrationsThisMonth, eventsByStatus, eventsByCategory,
    recentEvents, recentRegistrations,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.user.count(),
    prisma.registration.count({ where: { status: 'CONFIRMED' } }),
    prisma.certificate.count(),
    prisma.submission.count(),
    prisma.event.count({ where: { startDate: { gte: now }, status: 'PUBLISHED' } }),
    prisma.event.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.registration.count({ where: { createdAt: { gte: firstDayOfMonth } } }),

    // Eventos por status
    prisma.event.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    // Eventos por categoria
    prisma.event.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      where: { categoryId: { not: null } },
    }),

    // Eventos recentes
    prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, color: true } },
        organizer: { select: { name: true } },
        _count: { select: { registrations: true } },
      },
    }),

    // Inscrições recentes
    prisma.registration.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        event: { select: { title: true } },
      },
    }),
  ]);

  // Dados para gráfico de inscrições nos últimos 7 dias
  const last7Days = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      return prisma.registration.count({
        where: { createdAt: { gte: start, lte: end } },
      }).then(count => ({
        date: start.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        inscricoes: count,
      }));
    })
  );

  res.json({
    success: true,
    data: {
      overview: {
        totalEvents,
        totalUsers,
        totalRegistrations,
        totalCertificates,
        totalSubmissions,
        upcomingEvents,
        eventsThisMonth,
        registrationsThisMonth,
      },
      charts: {
        eventsByStatus: eventsByStatus.map(e => ({ status: e.status, count: e._count.id })),
        registrationsLast7Days: last7Days.reverse(),
      },
      recentEvents,
      recentRegistrations,
    },
  });
};

// ============================================================
// ESTATÍSTICAS DO ORGANIZADOR
// ============================================================
const getOrganizerStats = async (req, res) => {
  const organizerId = req.user.id;

  const [myEvents, totalRegistrations, totalCertificates, totalSubmissions] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId },
      include: {
        _count: { select: { registrations: { where: { status: 'CONFIRMED' } }, submissions: true } },
        category: { select: { name: true, color: true } },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.registration.count({
      where: { event: { organizerId }, status: 'CONFIRMED' },
    }),
    prisma.certificate.count({ where: { event: { organizerId } } }),
    prisma.submission.count({ where: { event: { organizerId } } }),
  ]);

  res.json({
    success: true,
    data: {
      myEvents,
      overview: { totalRegistrations, totalCertificates, totalSubmissions, totalEvents: myEvents.length },
    },
  });
};

// ============================================================
// EXPORTAR DADOS (lista de inscritos em CSV/JSON)
// ============================================================
const exportEventData = async (req, res) => {
  const { eventId, format = 'json' } = req.query;

  if (!eventId) throw createError('eventId é obrigatório.', 400);

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Evento não encontrado.', 404);

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão para exportar dados deste evento.', 403);
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId, status: 'CONFIRMED' },
    include: {
      user: { select: { name: true, email: true, cpf: true, phone: true, course: true, institution: true, matricula: true } },
      attendance: { select: { checkedInAt: true } },
      certificate: { select: { code: true, issuedAt: true } },
    },
    orderBy: { participantName: 'asc' },
  });

  const data = registrations.map((r, i) => ({
    'Nº': i + 1,
    'Nome': r.user.name,
    'Email': r.user.email,
    'CPF': r.user.cpf || '-',
    'Matrícula': r.user.matricula || '-',
    'Curso': r.user.course || '-',
    'Instituição': r.user.institution || '-',
    'Telefone': r.user.phone || '-',
    'Inscrito em': r.createdAt?.toLocaleDateString('pt-BR'),
    'Check-in': r.attendance ? r.attendance.checkedInAt.toLocaleString('pt-BR') : 'Não',
    'Certificado': r.certificate ? r.certificate.code : 'Não gerado',
  }));

  if (format === 'csv') {
    const headers = Object.keys(data[0] || {}).join(';');
    const rows = data.map(row => Object.values(row).join(';')).join('\n');
    const csv = `${headers}\n${rows}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inscricoes-${event.slug}.csv"`);
    return res.send('\uFEFF' + csv); // BOM para Excel reconhecer UTF-8
  }

  res.json({ success: true, data, event: { title: event.title, total: registrations.length } });
};

module.exports = { getAdminStats, getOrganizerStats, exportEventData };
