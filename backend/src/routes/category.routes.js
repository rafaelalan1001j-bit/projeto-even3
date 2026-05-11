const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');

const prisma = new PrismaClient();

// GET /api/categories — Listar categorias (público)
router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { events: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: categories });
});

// POST /api/categories — Criar categoria (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, color, icon } = req.body;
  const slugify = require('slugify');
  const slug = slugify(name, { lower: true, strict: true });

  const category = await prisma.category.create({
    data: { name, slug, description, color, icon },
  });
  res.status(201).json({ success: true, data: category });
});

// DELETE /api/categories/:id — Excluir categoria (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Categoria excluída.' });
});

module.exports = router;
