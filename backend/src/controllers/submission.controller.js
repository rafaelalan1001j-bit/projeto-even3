const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { createError } = require('../middlewares/errorHandler.middleware');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ============================================================
// SUBMETER ARTIGO
// ============================================================
const submitPaper = async (req, res) => {
  const { eventId, title, abstract, keywords, authors, area } = req.body;

  if (!req.file) throw createError('Arquivo PDF é obrigatório.', 400);

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Evento não encontrado.', 404);

  if (!event.acceptsSubmissions) {
    throw createError('Este evento não está aceitando submissões.', 400);
  }

  if (event.submissionDeadline && new Date() > event.submissionDeadline) {
    throw createError('O prazo para submissão de trabalhos encerrou.', 400);
  }

  // Verificar se o usuário tem inscrição no evento
  const registration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId } },
  });

  if (!registration) {
    throw createError('Você precisa estar inscrito no evento para submeter um trabalho.', 403);
  }

  const keywordsArray = typeof keywords === 'string'
    ? keywords.split(',').map(k => k.trim())
    : (Array.isArray(keywords) ? keywords : []);

  const authorsArray = typeof authors === 'string'
    ? authors.split(',').map(a => a.trim())
    : (Array.isArray(authors) ? authors : [req.user.name]);

  const submission = await prisma.submission.create({
    data: {
      userId: req.user.id,
      eventId,
      title,
      abstract,
      keywords: keywordsArray,
      authors: authorsArray,
      area: area || null,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'PENDING',
    },
  });

  // Notificação de submissão recebida
  await prisma.notification.create({
    data: {
      userId: req.user.id,
      title: 'Trabalho submetido!',
      message: `Seu trabalho "${title}" foi submetido e está em análise.`,
      type: 'SUBMISSION',
    },
  });

  logger.info(`Submissão: "${title}" por ${req.user.email} no evento ${event.title}`);

  res.status(201).json({
    success: true,
    message: 'Trabalho submetido com sucesso! Aguarde a avaliação.',
    data: submission,
  });
};

// ============================================================
// MINHAS SUBMISSÕES
// ============================================================
const getMySubmissions = async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { userId: req.user.id },
    include: {
      event: { select: { id: true, title: true, slug: true } },
      reviews: {
        select: {
          id: true, conclusion: true, recommendation: true, createdAt: true,
          isAnonymous: true, reviewer: { select: { name: true } },
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });

  res.json({ success: true, data: submissions });
};

// ============================================================
// SUBMISSÕES DE UM EVENTO (para organizador/avaliador)
// ============================================================
const getEventSubmissions = async (req, res) => {
  const { eventId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Evento não encontrado.', 404);

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão para visualizar as submissões.', 403);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const where = { eventId, ...(status && { status }) };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: { select: { id: true, name: true, email: true } },
        reviews: { select: { id: true, recommendation: true, score: true } },
      },
      orderBy: { submittedAt: 'desc' },
    }),
    prisma.submission.count({ where }),
  ]);

  res.json({
    success: true,
    data: submissions,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  });
};

// ============================================================
// AVALIAR SUBMISSÃO
// ============================================================
const reviewSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { score, originality, relevance, clarity, methodology, conclusion, recommendation, isAnonymous } = req.body;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { event: true, user: true },
  });

  if (!submission) throw createError('Submissão não encontrada.', 404);

  if (submission.event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão para avaliar esta submissão.', 403);
  }

  const review = await prisma.review.upsert({
    where: { submissionId_reviewerId: { submissionId, reviewerId: req.user.id } },
    update: { score, originality, relevance, clarity, methodology, conclusion, recommendation, isAnonymous: Boolean(isAnonymous) },
    create: {
      submissionId,
      reviewerId: req.user.id,
      score, originality, relevance, clarity, methodology, conclusion, recommendation,
      isAnonymous: Boolean(isAnonymous),
    },
  });

  // Atualizar status da submissão com base na recomendação
  let newStatus = 'UNDER_REVIEW';
  if (recommendation === 'APPROVE') newStatus = 'APPROVED';
  else if (recommendation === 'REJECT') newStatus = 'REJECTED';
  else if (recommendation === 'REVISION') newStatus = 'REVISION_REQUESTED';

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: newStatus, reviewedAt: new Date(), reviewerNotes: conclusion },
  });

  // Notificar autor
  await prisma.notification.create({
    data: {
      userId: submission.userId,
      title: 'Seu trabalho foi avaliado',
      message: `O trabalho "${submission.title}" recebeu um parecer: ${recommendation === 'APPROVE' ? '✅ Aprovado' : recommendation === 'REJECT' ? '❌ Reprovado' : '🔄 Revisão solicitada'}.`,
      type: 'SUBMISSION',
    },
  });

  res.json({ success: true, message: 'Avaliação registrada com sucesso!', data: review });
};

module.exports = { submitPaper, getMySubmissions, getEventSubmissions, reviewSubmission };
