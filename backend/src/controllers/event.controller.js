const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const { createError } = require('../middlewares/errorHandler.middleware');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ============================================================
// LISTAR EVENTOS (público, com filtros e paginação)
// ============================================================
const listEvents = async (req, res) => {
  const {
    page = 1, limit = 12,
    status, categoryId, search,
    upcoming, featured,
    sortBy = 'startDate', order = 'asc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    isPublic: true,
    ...(status ? { status } : { status: { in: ['PUBLISHED', 'ONGOING', 'FINISHED'] } }),
    ...(categoryId && { categoryId }),
    ...(featured === 'true' && { isFeatured: true }),
    ...(upcoming === 'true' && { startDate: { gte: new Date() } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: order },
      include: {
        category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        organizer: { select: { id: true, name: true, avatar: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNext: skip + Number(limit) < total,
      hasPrev: Number(page) > 1,
    },
  });
};

// ============================================================
// BUSCAR EVENTO POR SLUG
// ============================================================
const getEventBySlug = async (req, res) => {
  const { slug } = req.params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      category: true,
      organizer: { select: { id: true, name: true, avatar: true, email: true } },
      speakers: true,
      schedules: {
        include: { speaker: { select: { id: true, name: true, photo: true, title: true } } },
        orderBy: { startTime: 'asc' },
      },
      coOrganizers: true,
      _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } },
    },
  });

  if (!event) throw createError('Evento não encontrado.', 404);
  if (!event.isPublic) throw createError('Este evento não está disponível.', 403);

  // Calcular vagas disponíveis
  const availableSpots = event.maxParticipants
    ? event.maxParticipants - event._count.registrations
    : null;

  res.json({
    success: true,
    data: { ...event, availableSpots },
  });
};

// ============================================================
// CRIAR EVENTO
// ============================================================
const createEvent = async (req, res) => {
  const {
    title, description, shortDescription, startDate, endDate,
    registrationDeadline, location, address, isOnline, onlineLink,
    workload, maxParticipants, status, categoryId,
    isFeatured, isPublic, acceptsSubmissions,
    submissionDeadline, submissionGuidelines,
  } = req.body;

  // Gerar slug único
  let slug = slugify(title, { lower: true, strict: true, locale: 'pt' });
  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const event = await prisma.event.create({
    data: {
      id: uuidv4(),
      title,
      slug,
      description,
      shortDescription,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      location,
      address,
      isOnline: Boolean(isOnline),
      onlineLink,
      workload: Number(workload),
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      status: status || 'DRAFT',
      isFeatured: Boolean(isFeatured),
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      acceptsSubmissions: Boolean(acceptsSubmissions),
      submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
      submissionGuidelines,
      organizerId: req.user.id,
      categoryId: categoryId || null,
      // Banner (se foi enviado via upload)
      banner: req.file ? `/uploads/banners/${req.file.filename}` : null,
    },
    include: {
      category: true,
      organizer: { select: { id: true, name: true } },
    },
  });

  logger.info(`Evento criado: "${event.title}" por ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'Evento criado com sucesso!',
    data: event,
  });
};

// ============================================================
// ATUALIZAR EVENTO
// ============================================================
const updateEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw createError('Evento não encontrado.', 404);

  // Apenas o organizador ou admin pode editar
  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Você não tem permissão para editar este evento.', 403);
  }

  const updateData = { ...req.body };
  
  // Datas
  if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
  if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
  if (updateData.registrationDeadline) updateData.registrationDeadline = new Date(updateData.registrationDeadline);
  if (updateData.submissionDeadline) updateData.submissionDeadline = new Date(updateData.submissionDeadline);
  if (updateData.workload) updateData.workload = Number(updateData.workload);
  if (updateData.maxParticipants) updateData.maxParticipants = Number(updateData.maxParticipants);
  
  // Banner
  if (req.file) updateData.banner = `/uploads/banners/${req.file.filename}`;
  
  // Remover campos que não devem ser atualizados diretamente
  delete updateData.organizerId;
  delete updateData.slug;

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      organizer: { select: { id: true, name: true } },
    },
  });

  logger.info(`Evento atualizado: "${updatedEvent.title}" por ${req.user.email}`);

  res.json({
    success: true,
    message: 'Evento atualizado com sucesso!',
    data: updatedEvent,
  });
};

// ============================================================
// EXCLUIR EVENTO
// ============================================================
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) throw createError('Evento não encontrado.', 404);

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Você não tem permissão para excluir este evento.', 403);
  }

  if (event._count.registrations > 0) {
    throw createError(
      'Não é possível excluir um evento com inscrições. Cancele o evento.',
      409
    );
  }

  await prisma.event.delete({ where: { id } });

  logger.info(`Evento excluído: "${event.title}" por ${req.user.email}`);

  res.json({ success: true, message: 'Evento excluído com sucesso.' });
};

// ============================================================
// LISTAR EVENTOS DO ORGANIZADOR
// ============================================================
const getMyEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    where: { organizerId: req.user.id },
    include: {
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { registrations: true, submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: events });
};

module.exports = { listEvents, getEventBySlug, createEvent, updateEvent, deleteEvent, getMyEvents };
