const express = require('express');
const roomController = require('../controllers/roomController');
const authenticate = require('../middlewares/authenticate');
const { validateRoom } = require('../middlewares/zod-validator');

const router = express.Router();

router.post('/create', authenticate, validateRoom, roomController.createRoom);
router.post('/join', authenticate, roomController.joinRoom);
router.post('/', authenticate, roomController.listRooms);
router.get('/name/:roomId', authenticate, roomController.getRoomName);
router.put('/edit/:roomId', authenticate, roomController.editRoom);
router.delete('/delete/:roomId', authenticate, roomController.deleteRoom);
router.get('/:roomId/users', authenticate, roomController.getRoomUsers);

module.exports = router;