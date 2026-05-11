const express = require('express');
const router = express.Router();
const { generateEventCertificates, downloadCertificate, validateCertificate, getMyCertificates } = require('../controllers/certificate.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireOrganizerOrAdmin } = require('../middlewares/role.middleware');
const { pdfRateLimiter } = require('../middlewares/rateLimit.middleware');

// GET /api/certificates/validate/:code — Validação pública (sem auth)
router.get('/validate/:code', validateCertificate);

// GET /api/certificates/my — Meus certificados
router.get('/my', authenticate, getMyCertificates);

// POST /api/certificates/generate/:eventId — Gerar certificados em lote
router.post('/generate/:eventId', authenticate, requireOrganizerOrAdmin, generateEventCertificates);

// GET /api/certificates/download/:id — Baixar PDF
router.get('/download/:id', authenticate, pdfRateLimiter, downloadCertificate);

module.exports = router;
