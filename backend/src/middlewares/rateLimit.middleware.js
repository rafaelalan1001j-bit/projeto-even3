const rateLimit = require('express-rate-limit');

/**
 * Rate limiter geral para todas as rotas
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
  skip: (req) => {
    // Não aplicar limite em health check
    return req.path === '/health';
  },
});

/**
 * Rate limiter mais restrito para autenticação
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas de login
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
});

/**
 * Rate limiter para geração de certificados e PDFs
 */
const pdfRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20,
  message: {
    success: false,
    message: 'Muitas requisições de PDF. Tente novamente em 5 minutos.',
  },
});

module.exports = { rateLimiter, authRateLimiter, pdfRateLimiter };
