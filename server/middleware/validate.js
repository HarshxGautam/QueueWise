const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

const joinQueueSchema = Joi.object({
  customerName: Joi.string().min(2).max(50).required(),
  serviceId: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional(),
  priority: Joi.string().valid('standard', 'vip').default('standard')
});

const callNextSchema = Joi.object({
  counterNumber: Joi.number().integer().min(1).required()
});

const updateStatusSchema = Joi.object({
  ticketNumber: Joi.string().required(),
  status: Joi.string().valid('waiting', 'in-service', 'completed', 'cancelled', 'no-show').required(),
  counterNumber: Joi.number().integer().min(1).optional(),
  feedback: Joi.string().allow('', null).optional(),
  rating: Joi.number().min(0).max(5).optional()
});

const chatSchema = Joi.object({
  message: Joi.string().min(1).max(500).required(),
  ticketContext: Joi.object().allow(null).optional()
});

const loginSchema = Joi.object({
  username: Joi.string().allow('', null).optional(),
  rollNo: Joi.string().allow('', null).optional(),
  password: Joi.string().required()
}).or('username', 'rollNo');

module.exports = {
  validateJoinQueue: validate(joinQueueSchema),
  validateCallNext: validate(callNextSchema),
  validateUpdateStatus: validate(updateStatusSchema),
  validateChat: validate(chatSchema),
  validateLogin: validate(loginSchema)
};
