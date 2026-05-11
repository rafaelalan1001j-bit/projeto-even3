const express = require('express');
const router = express.Router();
const { register, getMyRegistrations, getEventRegistrations, cancelRegistration } = require('../controllers/registration.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireOrganizerOrAdmin } = require('../middlewares/role.middleware');

// POST /api/registrations — Inscrever-se
router.post('/', authenticate, register);

// GET /api/registrations/my — Minhas inscrições
router.get('/my', authenticate, getMyRegistrations);

// GET /api/registrations/event/:eventId — Inscrições de um evento (org/admin)
router.get('/event/:eventId', authenticate, requireOrganizerOrAdmin, getEventRegistrations);

// DELETE /api/registrations/:id — Cancelar inscrição
router.delete('/:id', authenticate, cancelRegistration);

module.exports = router;
