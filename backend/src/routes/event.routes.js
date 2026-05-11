const express = require('express');
const router = express.Router();
const { listEvents, getEventBySlug, createEvent, updateEvent, deleteEvent, getMyEvents } = require('../controllers/event.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireOrganizerOrAdmin } = require('../middlewares/role.middleware');
const { uploadBanner } = require('../middlewares/upload.middleware');

// GET /api/events — Público
router.get('/', optionalAuth, listEvents);

// GET /api/events/my — Eventos do organizador (protegido)
router.get('/my', authenticate, requireOrganizerOrAdmin, getMyEvents);

// GET /api/events/:slug — Público
router.get('/:slug', optionalAuth, getEventBySlug);

// POST /api/events — Criar evento (organizador/admin)
router.post('/', authenticate, requireOrganizerOrAdmin, uploadBanner, createEvent);

// PUT /api/events/:id — Editar evento
router.put('/:id', authenticate, requireOrganizerOrAdmin, uploadBanner, updateEvent);

// DELETE /api/events/:id — Excluir evento
router.delete('/:id', authenticate, requireOrganizerOrAdmin, deleteEvent);

module.exports = router;
