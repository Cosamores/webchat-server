const prisma = require('../utils/prismaConnect');

exports.createRoom = async (req, res) => {
  const { name } = req.body;

  try {
    const room = await prisma.room.create({
      data: {
        name,
        creator: {
          connect: { id: req.userId },
        },
      },
    });
    const roomLink = `http://localhost:3000/rooms/${room.id}`;
    res.status(201).json({ message: 'Sala criada', room, roomLink });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(400).json({ error: 'Erro ao criar sala' });
  }
};

exports.joinRoom = async (req, res) => {
  const { roomId } = req.body;

  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
      select: { creatorId: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    // Add user to room using the UserRoom model
    await prisma.userRoom.create({
      data: {
        userId: req.userId,
        roomId: parseInt(roomId),
      },
    });

    res.status(200).json({ message: 'Entrou na sala', room });
  } catch (error) {
    console.error('Não foi possível entrar na sala:', error);
    res.status(400).json({ error: 'Não foi possível entrar na sala' });
  }
};

exports.listRooms = async (req, res) => {
  try {
    const { userId } = req.body;

    const userRooms = await prisma.userRoom.findMany({
      where: { userId: parseInt(userId) },
      select: { roomId: true },
    });

    const roomIds = [...new Set(userRooms.map((ur) => ur.roomId))];
    // console.log('Unique user room IDs:', roomIds);
    // console.log('User ID:', userId);
    const rooms = await prisma.room.findMany({
      where: {
        AND: [
          {
            OR: [
              { creatorId: parseInt(userId) },
              { id: { in: roomIds } },
            ],
          },
        ],
      },
    });
    const filteredRooms = rooms.filter((room) => !room.deleted);
    // console.log('Rooms found:', filteredRooms);
    res.status(200).json(filteredRooms);
  } catch (error) {
    //console.log('Erro ao buscar salas:', error);
    res.status(400).json({ error: 'Erro ao buscar salas' });
  }
};

exports.getRoomUsers = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
      include: { users: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    res.status(200).json(room.users);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao buscar usuários' });
  }
};

exports.editRoom = async (req, res) => {
  const { roomId } = req.params; // Extract roomId from req.params
  const { name } = req.body; // Extract 'name' from req.body

  if (!name) {
    return res.status(400).json({ error: 'Nome da sala é necessário.' });
  }

  try {
    const room = await prisma.room.update({
      where: { id: parseInt(roomId) }, // Ensure roomId is parsed as an integer
      data: { name }, // Use the extracted 'name' to update
    });

    res.status(200).json({ message: 'Nome da sala atualizado com sucesso', room });
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    res.status(500).json({ error: 'Erro ao atualizar sala' }); // Changed to 500 for server errors
  }
};

exports.deleteRoom = async (req, res) => {
  const { roomId } = req.body;
   console.log('roomId na controller deleteRoom', roomId); // Log roomId for debugging
  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) }, 
      select: { creatorId: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    if (parseInt(room.creatorId) !== parseInt(req.userId)) {
      return res.status(403).json({ error: 'Você não tem permissão para deletar esta sala' });
    }

    // Soft delete the room
    await prisma.room.update({
      where: { id: parseInt(roomId) },
      data: { deleted: true },
    });

    res.status(200).json({ message: 'Sala deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar sala:', error);
    res.status(400).json({ error: 'Erro ao deletar sala' });
  }
};

exports.leaveRoom = async (req, res) => {
  const { roomId } = req.body;

  try {
    // Check if the user is a member of the room
    const userRoom = await prisma.userRoom.findFirst({
      where: {
        userId: req.userId,
        roomId: parseInt(roomId),
      },
    });

    if (!userRoom) {
      return res.status(404).json({ error: 'Você não é membro desta sala' });
    }

    // Delete the user from the room
    await prisma.userRoom.delete({
      where: { id: userRoom.id },
    });

    res.status(200).json({ message: 'Saiu da sala' });
  } catch (error) {
    console.error('Erro ao sair da sala:', error);
    res.status(400).json({ error: 'Erro ao sair da sala' });
  }
}

exports.getRoomName = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) }, // Ensure roomId is parsed as an integer
    });

    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    res.status(200).json({ name: room.name });
  } catch (error) {
    console.error('Erro ao buscar nome da sala:', error);
    res.status(400).json({ error: 'Erro ao buscar nome da sala' });
  }
}