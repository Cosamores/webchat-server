const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(15)
    .messages({
      'string.min': 'O nome de usuário deve ter no mínimo 3 caracteres.',
      'string.max': 'O nome de usuário pode ter no máximo 15 caracteres.'
    }),
  password: Joi.string()
    .min(4)
    .messages({
      'string.min': 'A senha deve ter no mínimo 4 caracteres.'
    })
});

const roomSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .messages({
      'string.min': 'O nome da sala deve ter no mínimo 3 letras.',
      'string.max': 'O nome da sala pode ter no máximo 50 letras.'
    })
});

const messageSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(1024)
    .messages({
      'string.max': 'A mensagem pode ter no máximo 1024 caracteres.'
    })
});

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    console.log("Validado com sucesso", req.body);
    next();
  } catch (error) {
    console.log("Erro de validação:", error.details);
    res.status(400).json({ error: error.details });
  }
};

exports.validateUser = validate(userSchema);
exports.validateRoom = validate(roomSchema);
exports.validateMessage = validate(messageSchema);
