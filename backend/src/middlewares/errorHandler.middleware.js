const logger = require('../utils/logger');

/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error(`${err.name}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Erros do Prisma
  if (err.code) {
    // Violação de constraint única
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'campo';
      return res.status(409).json({
        success: false,
        message: `Já existe um registro com este ${field}.`,
        code: 'DUPLICATE_ENTRY',
      });
    }
    // Registro não encontrado
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado.',
        code: 'NOT_FOUND',
      });
    }
    // FK violation
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Referência inválida. Verifique os dados enviados.',
        code: 'FOREIGN_KEY_VIOLATION',
      });
    }
  }

  // Erros de validação (express-validator ou Zod)
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos.',
      errors: err.errors || err.issues,
    });
  }

  // Erros de JWT (já tratados no middleware de auth, mas por segurança)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado. Faça login novamente.',
    });
  }

  // Erro de arquivo muito grande (Multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo permitido: 10MB.',
    });
  }

  // Erro customizado com status
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      success: false,
      message: err.message || 'Erro na requisição.',
    });
  }

  // Erro genérico 500
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor.'
      : err.message || 'Erro interno do servidor.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * Cria um erro customizado com status HTTP
 */
const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = { errorHandler, createError };
