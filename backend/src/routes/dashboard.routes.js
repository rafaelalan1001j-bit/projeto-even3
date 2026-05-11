const express = require('express');
const router = express.Router();
const { getAdminStats, getOrganizerStats, exportEventData } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin, requireOrganizerOrAdmin } = require('../middlewares/role.middleware');

// GET /api/dashboard/admin — Estatísticas do admin
router.get('/admin', authenticate, requireAdmin, getAdminStats);

// GET /api/dashboard/organizer — Estatísticas do organizador
router.get('/organizer', authenticate, requireOrganizerOrAdmin, getOrganizerStats);

// GET /api/dashboard/export — Exportar dados
router.get('/export', authenticate, requireOrganizerOrAdmin, exportEventData);

module.exports = router;
