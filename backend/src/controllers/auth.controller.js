const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { createError } = require('../middlewares/errorHandler.middleware');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Gera tokens JWT de acesso e refresh
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return { accessToken };
};

// ============================================================
// REGISTRAR USUÁRIO
// ============================================================
const register = async (req, res) => {
  const { name, email, password, cpf, matricula, phone, course, institution } = req.body;

  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw createError('Este e-mail já está cadastrado.', 409);
  }

  // Verificar CPF único se fornecido
  if (cpf) {
    const existingCpf = await prisma.user.findUnique({ where: { cpf } });
    if (existingCpf) {
      throw createError('Este CPF já está cadastrado.', 409);
    }
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 12);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      cpf: cpf || null,
      matricula: matricula || null,
      phone: phone || null,
      course: course || null,
      institution: institution || 'UFRA Campus Paragominas',
      role: 'PARTICIPANT',
    },
    select: {
      id: true, name: true, email: true, role: true,
      cpf: true, matricula: true, phone: true, course: true, institution: true,
      createdAt: true,
    },
  });

  const { accessToken } = generateTokens(user.id);

  // Tentar enviar email de boas-vindas (não bloqueia o registro se falhar)
  emailService.sendWelcomeEmail(user).catch(err =>
    logger.warn(`Falha ao enviar email de boas-vindas para ${user.email}: ${err.message}`)
  );

  logger.info(`Novo usuário registrado: ${user.email} (${user.role})`);

  res.status(201).json({
    success: true,
    message: 'Conta criada com sucesso!',
    data: { user, accessToken },
  });
};

// ============================================================
// LOGIN
// ============================================================
const login = async (req, res) => {
  const { email, password } = req.body;

  // Buscar usuário (incluindo senha para comparação)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, name: true, email: true, password: true,
      role: true, isActive: true, avatar: true,
      cpf: true, matricula: true, phone: true, course: true, institution: true,
    },
  });

  if (!user) {
    throw createError('E-mail ou senha incorretos.', 401);
  }

  if (!user.isActive) {
    throw createError('Sua conta está desativada. Entre em contato com o administrador.', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('E-mail ou senha incorretos.', 401);
  }

  const { accessToken } = generateTokens(user.id);

  // Remover senha da resposta
  const { password: _, ...userWithoutPassword } = user;

  logger.info(`Login: ${user.email} (${user.role})`);

  res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    data: { user: userWithoutPassword, accessToken },
  });
};

// ============================================================
// MEUS DADOS (perfil autenticado)
// ============================================================
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      cpf: true, matricula: true, phone: true, course: true,
      institution: true, avatar: true, emailVerified: true,
      createdAt: true, updatedAt: true,
      _count: {
        select: {
          registrations: true,
          certificates: true,
          submissions: true,
        },
      },
    },
  });

  res.json({ success: true, data: user });
};

// ============================================================
// ESQUECI A SENHA
// ============================================================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Retorna sucesso mesmo se o email não existir (segurança)
  if (!user) {
    return res.json({
      success: true,
      message: 'Se este e-mail existir, você receberá as instruções em breve.',
    });
  }

  // Gerar token de reset
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Enviar email
  const resetUrl = `${process.env.FRONTEND_URL}/recuperar-senha/${token}`;
  emailService.sendPasswordResetEmail(user, resetUrl).catch(err =>
    logger.warn(`Falha ao enviar email de reset: ${err.message}`)
  );

  logger.info(`Reset de senha solicitado para: ${email}`);

  res.json({
    success: true,
    message: 'Se este e-mail existir, você receberá as instruções em breve.',
  });
};

// ============================================================
// RESETAR SENHA
// ============================================================
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    throw createError('Token inválido ou expirado.', 400);
  }

  if (resetToken.usedAt) {
    throw createError('Este link já foi utilizado.', 400);
  }

  if (new Date() > resetToken.expiresAt) {
    throw createError('Token expirado. Solicite um novo link.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  logger.info(`Senha redefinida para: ${resetToken.user.email}`);

  res.json({ success: true, message: 'Senha redefinida com sucesso!' });
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
