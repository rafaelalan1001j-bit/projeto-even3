/**
 * Servidor principal - UFRA Eventos API
 */

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const { errorHandler } = require('./middlewares/errorHandler.middleware');
const { rateLimiter } = require('./middlewares/rateLimit.middleware');
const logger = require('./utils/logger');

// Rotas
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const certificateRoutes = require('./routes/certificate.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const submissionRoutes = require('./routes/submission.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARES GLOBAIS
// ============================================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: mobile apps, curl)
    if (!origin) return callback(null, true);
    // Permite qualquer subdomínio vercel.app em produção
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.railway\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
app.use(rateLimiter);

// Compressão
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logs HTTP
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// Servir arquivos estáticos (uploads e certificados)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '1d',
  etag: true,
}));
app.use('/certificates', express.static(path.join(__dirname, '..', 'certificates'), {
  maxAge: '1d',
}));

// ============================================================
// ROTAS DA API
// ============================================================

const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/registrations`, registrationRoutes);
app.use(`${API_PREFIX}/certificates`, certificateRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/submissions`, submissionRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'UFRA Eventos API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================
// ERROR HANDLER (deve ser o último middleware)
// ============================================================
app.use(errorHandler);

// ============================================================
// INICIALIZAR SERVIDOR
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 UFRA Eventos API rodando em http://0.0.0.0:${PORT}`);
  logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📁 Uploads em: ${path.join(__dirname, '..', 'uploads')}`);
});

module.exports = app;
