import { StatusCodes } from "http-status-codes";
import { authServices } from "~/services/authServices";
import jwt from "jsonwebtoken";
import { env } from "~/config/environment";

const login = async (req, res) => {
  try {
    const result = await authServices.login(req.body);

    // save Token to cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false, // localhost dể false, prod để true
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Login successfully",
      user: result.data,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
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
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // i day
    });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Login successfully",
      user: result.data,
    });
  } catch (error) {
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

const togglePlaylist = async (req, res) => {
  try {
    const userId = req.user._id;
    const movieData = req.body;

    const result = await authServices.togglePlaylist(userId, movieData);

    res.status(StatusCodes.OK).json({
      status: true,
      msg:
        result.status === "added"
          ? "Đã thêm vào danh sách xem sau"
          : "Đã xóa khỏi danh sách xem sau",
      result: result,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const saveProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const movieData = req.body;

    await authServices.saveProgress(userId, movieData);

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Lưu tiến trình thành công",
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const removeContinueWatching = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slug } = req.body;

    await authServices.removeContinueWatching(userId, slug);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Đã xóa khỏi tiếp tục xem",
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await authServices.deleteUser(id);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Xóa người dùng thành công",
      result: result,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// pagination for favorite, playlist, continue watching
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit } = req.query;

    const result = await authServices.getFavorites(userId, { page, limit });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Lấy danh sách yêu thích thành công",
      data: result,
      // totalItems: result.totalItems,
      // currentPage: result.currentPage,
      // totalPages: result.totalPages,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const getPlaylist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit } = req.query;

    const result = await authServices.getPlaylist(userId, { page, limit });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Lấy danh sách xem sau thành công",
      data: result,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const getContinueWatching = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit } = req.query;

    const result = await authServices.getContinueWatching(userId, {
      page,
      limit,
    });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Lấy danh sách xem tiếp thành công",
      data: result,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};
export const authController = {
  login,
  loginGoogle,
  logout,
  register,
  togglePlaylist,
  saveProgress,
  removeContinueWatching,
  deleteUser,
  getFavorites,
  getPlaylist,
  getContinueWatching,
};
