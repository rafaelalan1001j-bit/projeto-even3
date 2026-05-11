const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { createError } = require('../middlewares/errorHandler.middleware');

const prisma = new PrismaClient();

// GET /api/users — Listar usuários (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        cpf: true, matricula: true, course: true, institution: true,
        createdAt: true,
        _count: { select: { registrations: true, certificates: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  });
});

// PATCH /api/users/:id — Atualizar usuário (admin: pode mudar role/status; participante: só o próprio perfil)
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, phone, course, institution, role, isActive, password } = req.body;

  // Participante só pode editar o próprio perfil
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão para editar este usuário.', 403);
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (course) updateData.course = course;
  if (institution) updateData.institution = institution;

  // Apenas admin pode mudar role e status
  if (req.user.role === 'ADMIN') {
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
  }

  // Troca de senha
  if (password) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  // Avatar
  if (req.file) updateData.avatar = `/uploads/avatars/${req.file.filename}`;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true, name: true, email: true, role: true, isActive: true,
      phone: true, course: true, institution: true, avatar: true, updatedAt: true,
    },
  });

  res.json({ success: true, message: 'Usuário atualizado com sucesso!', data: user });
});

// PATCH /api/users/:id/avatar — Upload de avatar
router.patch('/:id/avatar', authenticate, uploadAvatar, async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão.', 403);
  }

  if (!req.file) throw createError('Imagem não enviada.', 400);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { avatar: `/uploads/avatars/${req.file.filename}` },
    select: { id: true, avatar: true },
  });

  res.json({ success: true, data: user });
});

// GET /api/users/:id/notifications — Notificações do usuário
router.get('/:id/notifications', authenticate, async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
    throw createError('Sem permissão.', 403);
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: req.params.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  await prisma.notification.updateMany({
    where: { userId: req.params.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  res.json({ success: true, data: notifications });
});

module.exports = router;
