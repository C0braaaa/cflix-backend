import { StatusCodes } from "http-status-codes";
import { authServices } from "~/services/authServices";
const login = async (req, res) => {
  try {
    const result = await authServices.login(req.body);

    // save Token to cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true, // localhost dể false, prod để true
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Login successfully",
      user: result.data,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// login google
const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    const result = await authServices.loginGoogle(credential);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // i day
    });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Login successfully",
      user: result.data,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// logout
const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(StatusCodes.OK).json({
    message: "Logout successfully",
  });
};

// register
const register = async (req, res) => {
  try {
    const createNewUser = await authServices.register(req.body);

    res.status(StatusCodes.CREATED).json({
      status: true,
      msg: "Register successfully",
      user: createNewUser,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(">>> Request nhận được email:", email);
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Vui lòng cung cấp Email!",
      });
    }

    const result = await authServices.forgotPassword(email);

    res.status(StatusCodes.OK).json({
      status: true,
      msg: result.message,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPass } = req.body;

    if (!token || !newPass) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thiếu thông tin Token hoặc Mật khẩu mới!",
      });
    }

    const result = await authServices.resetPassword(token, newPass);

    res.status(StatusCodes.OK).json({
      status: true,
      msg: result.message,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const verifyTokenResetPass = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw {
        code: StatusCodes.BAD_REQUEST,
        message: "Thiếu thông tin Token",
      };
    }
    await authServices.verifyTokenResetPass(token);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Token hợp lê!",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;

    const { currentPass, newPass } = req.body;

    if (!currentPass || !newPass) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Vui lòng nhập các trường tương ứng!",
      });
    }

    const result = await authServices.changePassword(
      userId,
      currentPass,
      newPass,
    );

    res.status(StatusCodes.OK).json({
      status: true,
      msg: result.message,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};
export const authController = {
  login,
  loginGoogle,
  logout,
  register,
  forgotPassword,
  resetPassword,
  verifyTokenResetPass,
  changePassword,
};
