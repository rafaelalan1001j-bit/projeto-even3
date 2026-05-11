/**
 * Middleware de controle de acesso baseado em papéis (RBAC)
 */

/**
 * Requer que o usuário tenha um dos papéis especificados
 * @param {...string} roles - Papéis permitidos
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso.',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

// Atalhos convenientes
const requireAdmin = requireRole('ADMIN');
const requireOrganizerOrAdmin = requireRole('ADMIN', 'ORGANIZER');
const requireAnyRole = requireRole('ADMIN', 'ORGANIZER', 'PARTICIPANT');

module.exports = { requireRole, requireAdmin, requireOrganizerOrAdmin, requireAnyRole };
