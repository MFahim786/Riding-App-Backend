const Joi = require('joi');

const feedbackValidationSchema = Joi.object({
  ride: Joi.string().hex().length(24).required(),
  passenger: Joi.string().hex().length(24).required(),
  driver: Joi.string().hex().length(24).required(),
  rating: Joi.number().min(1).max(5).required(),
  comments: Joi.string().optional()
});
