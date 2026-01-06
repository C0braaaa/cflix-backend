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

const register = async (req, res, next) => {
  const correctCondition = Joi.object({
    username: Joi.string().required().min(6).max(20).trim().strict().messages({
      "any.required": "Username là bắt buộc",
      "string.min": "Username phải ít nhất 6 ký tự",
      "string.max": "Username phải nhất 20 ký tự",
      "string.empty": "Username không được trống",
    }),
    email: Joi.string().required().email().trim().strict().messages({
      "any.required": "Email là bắt buộc",
      "string.email": "Email không hợp lệ",
      "string.empty": "Email không được trong",
    }),
    password: Joi.string().required().min(6).trim().strict().messages({
      "any.required": "Mật khẩu là bắt buộc",
      "string.min": "Mật khẩu phải ít nhất 6 ký tự",
      "string.empty": "Mật khẩu không được trống",
    }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.required": "Mật khẩu xác nhận là bắt buộc",
        "any.only": "Mật khẩu xác nhận không khớp",
      })
      .strip(),
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
  register,
};
