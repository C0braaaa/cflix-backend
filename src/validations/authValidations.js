import Joi from "joi";
import { StatusCodes } from "http-status-codes";

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().email().trim().strict().messages({
      "any.required": "Email là bắt buộc",
      "string.email": "Email không hợp lệ",
      "string.empty": "Email không được để trống",
    }),
    password: Joi.string().required().min(6).trim().strict().messages({
      "any.required": "Mật khẩu là bắt buộc",
      "string.min": "Mật khẩu phải ít nhất 6 ký tự",
      "string.empty": "Mật khẩu không được để trống",
    }),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message,
    });
  }
};

export const authValidation = {
  login,
};
