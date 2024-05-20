const Joi = require('joi');

const driverValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
  profilePicUrl: Joi.string().uri().required(),
  licenseNumber: Joi.string().required(),
  licenseImageUrl: Joi.string().uri().required(),
  idCardImageUrl: Joi.string().uri().required(),
  location: Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required()
  }).required(),
  vehicle: Joi.string().hex().length(24).required()
});
