const express = require('express');
const router = express.Router();
const { checkIn, manualCheckIn, getEventAttendance } = require('../controllers/attendance.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireOrganizerOrAdmin } = require('../middlewares/role.middleware');

// POST /api/attendance/checkin — Check-in por QR Code (pode ser sem auth para leitores físicos)
router.post('/checkin', optionalAuth, checkIn);

// POST /api/attendance/manual — Check-in manual
router.post('/manual', authenticate, requireOrganizerOrAdmin, manualCheckIn);

// GET /api/attendance/event/:eventId — Lista de presença
router.get('/event/:eventId', authenticate, requireOrganizerOrAdmin, getEventAttendance);

module.exports = router;
