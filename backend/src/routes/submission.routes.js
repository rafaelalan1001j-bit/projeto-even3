const express = require('express');
const router = express.Router();
const { submitPaper, getMySubmissions, getEventSubmissions, reviewSubmission } = require('../controllers/submission.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireOrganizerOrAdmin } = require('../middlewares/role.middleware');
const { uploadSubmission } = require('../middlewares/upload.middleware');

// POST /api/submissions — Submeter artigo
router.post('/', authenticate, uploadSubmission, submitPaper);

// GET /api/submissions/my — Minhas submissões
router.get('/my', authenticate, getMySubmissions);

// GET /api/submissions/event/:eventId — Submissões de um evento
router.get('/event/:eventId', authenticate, requireOrganizerOrAdmin, getEventSubmissions);

// PUT /api/submissions/:submissionId/review — Avaliar submissão
router.put('/:submissionId/review', authenticate, requireOrganizerOrAdmin, reviewSubmission);

module.exports = router;
