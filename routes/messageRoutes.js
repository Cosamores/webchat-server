const express = require('express');
const messageController = require('../controllers/messageController');
const authenticate = require('../middlewares/authenticate');
const { validateMessage } = require('../middlewares/zod-validator');
const multer = require('multer');

// Custom storage configuration
const storage = multer.diskStorage({
  destination: 'public/uploads/messageMedia', 
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(null, false); // Reject non-image files silently
  } else {
    cb(null, true);
  }
};

// Multer upload configuration
const messageUpload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const router = express.Router();

router.post('/create', authenticate, messageUpload.single('file'), messageController.createMessage);
router.get('/room/:roomId', authenticate, messageController.getRoomMessages);
router.put('/edit/:messageId', authenticate, validateMessage, messageController.editMessage);
router.delete('/delete/:messageId', authenticate, messageController.deleteMessage);

module.exports = router;