const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.uploadFile = async (req, res) => {
  const { roomId, message: messageData } = req.body;
  const { file } = req;

  if (!file || !roomId) {
    return res.status(400).json({ error: 'Arquivo e roomId são necessários' });
  }

  try {
    const messageContent = messageData ? JSON.parse(messageData).content : '';
    const message = await prisma.message.create({
      data: {
        content: messageContent,
        fileUrl: `/uploads/messageMedia/${file.filename}`,
        fileType: file.mimetype,
        room: { connect: { id: roomId } },
        sender: { connect: { id: req.userId } },
      },
      include: {
        sender: { select: { username: true } },
      },
    });

    res.status(201).json({ message: 'Arquivo armazenado com sucesso.', data: message });
  } catch (error) {
    console.error('Erro ao armazenar arquivo:', error);
    res.status(500).json({ error: 'Erro ao armazenar arquivo' });
  }
};