const Joi = require('joi');

const passengerValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
  location: Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required()
  }).required(),
  paymentMethods: Joi.array().items(Joi.string()),
  preferences: Joi.object({
    language: Joi.string().default('en'),
    preferredDriverRating: Joi.number().min(1).max(5).default(4.0)
  }).default()
});
