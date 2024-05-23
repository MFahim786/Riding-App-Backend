const Joi = require('joi');

const vehicleValidationSchema = Joi.object({
  driver: Joi.string().hex().length(24).required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(1886).required(),
  // licensePlate: Joi.string().required(),
  color: Joi.string().required()
});
