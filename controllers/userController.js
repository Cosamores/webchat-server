const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.searchUsers = async (req, res) => {
  const { username } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive',
        },
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao buscar usuários.' });
  }
};

exports.changeUsername = async (req, res) => {
  const { userId, newUsername } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { username: true }
  });

  if (user.username === newUsername) {
    return res.status(400).json({ error: 'O novo nome de usuário deve ser diferente do atual.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar o nome de usuário.' });
  }
};