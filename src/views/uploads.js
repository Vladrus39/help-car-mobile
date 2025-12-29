const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

// Настройка multer для загрузки в память
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла. Только JPEG, PNG, WEBP.'));
    }
  },
});

// Загрузка изображений для запроса
router.post(
  '/requests/:requestId/images',
  protect,
  upload.array('images', 5),
  uploadController.uploadRequestImages
);

// Получить изображения запроса
router.get(
  '/requests/:requestId/images',
  uploadController.getRequestImages
);

// Загрузка изображений для сообщения в чате
router.post(
  '/chats/:chatId/messages/:messageId/images',
  protect,
  upload.array('images', 5),
  uploadController.uploadChatImages
);

// Удалить изображение
router.delete(
  '/images/:imageId',
  protect,
  uploadController.deleteImage
);

// Загрузка аватара пользователя
router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  uploadController.uploadAvatar
);

module.exports = router;

