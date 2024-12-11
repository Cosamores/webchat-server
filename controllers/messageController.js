const { PrismaClient } = require('@prisma/client');
// const { getWebSocketServer } = require('../utils/websocket'); // Remove this line
// const WebSocket = require('ws'); // Remove this line

const prisma = new PrismaClient();

exports.getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  // console.log('roomId no getRoomMessages:', roomId);
  if (!roomId) {
    console.error('RoomId is missing');
    return res.status(400).json({ error: 'RoomId é necessário' });
  }
  try {
    // Update existing messages to set a default value for the type field if it is null
    await prisma.message.updateMany({
      where: { roomId, type: null },
      data: { type: 'text' },
    });

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: {
        sender: {
          select: { username: true, created_at: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });
    // console.log('Mensagens encontradas:', messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(400).json({ error: 'Erro ao buscar mensagens.' });
  }
};

exports.editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { content },
    });
    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao editar mensagem.' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    await prisma.message.delete({
      where: { id: messageId },
    });
    res.status(200).json({ message: 'Mensagem deletada com sucesso.' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar mensagem.' });
  }
};

exports.createMessage = async (req, res) => {
  const { roomId } = req.body;
  const { file } = req;
  let messageContent = null;

  if (!roomId) {
    return res.status(400).json({ error: 'RoomId é necessário' });
  }

  try {
    const type = file ? 'image' : 'text';

    if (type === 'text') {
      messageContent = req.body.content;
      if (!messageContent) {
        return res.status(400).json({ error: 'Conteúdo da mensagem é necessário.' });
      }
    }

    const message = await prisma.message.create({
      data: {
        content: messageContent,
        fileUrl: file ? `/uploads/messageMedia/${file.filename}` : null, // Ensure this matches the static route
        fileType: file ? file.mimetype : null,
        type: type,
        room: { connect: { id: roomId } },
        sender: { connect: { id: req.userId } },
      },
      include: {
        sender: { select: { username: true } },
      },
    });

    // Remove WebSocket broadcasting
    // const wss = getWebSocketServer();
    // if (!wss) {
    //   console.error("WebSocket server is not initialized.");
    //   return res.status(500).json({ error: "WebSocket server not available." });
    // }

    // const broadcastData = {
    //   id: message.id,
    //   content: message.content,
    //   fileUrl: message.fileUrl,
    //   type: message.type,
    //   sender: { username: message.sender.username },
    //   createdAt: message.created_at,
    // };

    // wss.clients.forEach((client) => {
    //   if (
    //     client.readyState === WebSocket.OPEN &&
    //     client.roomId === roomId
    //   ) {
    //     client.send(JSON.stringify(broadcastData));
    //     console.log(`Broadcasted message ${message.id} to user ${client.userId}`);
    //   }
    // });

    res.status(201).json({ message: 'Mensagem criada com sucesso.', data: message });
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
};
