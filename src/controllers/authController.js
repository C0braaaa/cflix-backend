import { StatusCodes } from "http-status-codes";
import { authServices } from "~/services/authServices";

const login = async (req, res) => {
  try {
    const result = await authServices.login(req.body);

    // save Token to cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false, // localhost dể false, prod để true
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Login successfully",
      user: result.data,
    });
  } catch (error) {
    console.log("🔥 Lỗi chi tiết:", error);
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// logout
const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
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
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

//update
const update = async (req, res) => {
  try {
    const userId = req.user._id;

    const updateUser = await authServices.update(userId, req.body);

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Update successfully",
      user: updateUser,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const authController = {
  login,
  logout,
  register,
  update,
};
