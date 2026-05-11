const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Criar diretórios necessários
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
const DIRS = {
  images: path.join(UPLOAD_DIR, 'images'),
  banners: path.join(UPLOAD_DIR, 'banners'),
  avatars: path.join(UPLOAD_DIR, 'avatars'),
  speakers: path.join(UPLOAD_DIR, 'speakers'),
  submissions: path.join(UPLOAD_DIR, 'submissions'),
};

Object.values(DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Cria storage do Multer para um diretório específico
 */
const createStorage = (destDir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  });

/**
 * Filtro para imagens
 */
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens JPG, PNG e WebP são permitidas.'));
  }
};

/**
 * Filtro para PDFs
 */
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos PDF são permitidos.'));
  }
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024;  // 10MB

// Uploads específicos por contexto
const uploadBanner = multer({
  storage: createStorage(DIRS.banners),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single('banner');

const uploadAvatar = multer({
  storage: createStorage(DIRS.avatars),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single('avatar');

const uploadSpeakerPhoto = multer({
  storage: createStorage(DIRS.speakers),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single('photo');

const uploadSubmission = multer({
  storage: createStorage(DIRS.submissions),
  fileFilter: pdfFilter,
  limits: { fileSize: MAX_PDF_SIZE },
}).single('file');

module.exports = {
  uploadBanner,
  uploadAvatar,
  uploadSpeakerPhoto,
  uploadSubmission,
  DIRS,
  UPLOAD_DIR,
};
