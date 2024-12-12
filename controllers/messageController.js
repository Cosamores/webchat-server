const prisma = require('../utils/prismaConnect');

exports.getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) {
    console.error('RoomId is missing');
    return res.status(400).json({ error: 'RoomId é necessário' });
  }
  try {
    await prisma.message.updateMany({
      where: { roomId: parseInt(roomId) },
      data: { type: 'text' },
    });

    const messages = await prisma.message.findMany({
      where: { roomId: parseInt(roomId) },
      include: {
        sender: {
          select: { username: true, created_at: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });
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
      where: { id: parseInt(messageId) },
      data: { content },
    });
    console.log('Mensagem editada com sucesso:', message);
    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao editar mensagem.' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    await prisma.message.delete({
      where: { id: parseInt(messageId) },
    });
    res.status(200).json({ message: 'Mensagem deletada com sucesso.' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar mensagem.' });
  }
};

exports.createMessage = async (req, res) => {
  const { roomId, content } = req.body;
  const { file } = req;
  let messageContent = content;

  if (!roomId) {
    return res.status(400).json({ error: 'RoomId é necessário' });
  }

  try {
    const type = file ? 'image' : 'text';

    if (type === 'text' && !messageContent) {
      return res.status(400).json({ error: 'Conteúdo da mensagem é necessário.' });
    }

    const message = await prisma.message.create({
      data: {
        content: messageContent,
        fileUrl: file ? `/uploads/messageMedia/${file.filename}` : null,
        fileType: file ? file.mimetype : null,
        type: type,
        room: { connect: { id: parseInt(roomId) } },
        sender: { connect: { id: req.userId } },
      },
      include: {
        sender: { select: { username: true } },
      },
    });

    console.log('Message created successfully:', message);
    res.status(201).json({ message: 'Mensagem criada com sucesso.', data: message });
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
};
