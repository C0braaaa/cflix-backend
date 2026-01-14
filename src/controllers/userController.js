import { StatusCodes } from "http-status-codes";
import { userServices } from "~/services/userServices";
import jwt from "jsonwebtoken";
import { env } from "~/config/environment";

//update
const update = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedUser = await userServices.update(userId, req.body);

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
    }

    // create newToken (refresh token)
    const userInfo = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar_url: updatedUser.avatar_url,
      gender: updatedUser.gender,
      isActive: updatedUser.isActive,
      // playlist: updatedUser.playlist,
      // continue_watching: updatedUser.continue_watching,
      // favorite: updatedUser.favorite,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    const newAccessToken = jwt.sign(userInfo, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Update successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// get all users
const getAllUSers = async (req, res) => {
  try {
    const { keyword, role, is_active } = req.query;

    const currentId = req.user._id;

    const users = await userServices.getAllUSers({
      keyword,
      role,
      is_active,
      currentId,
    });
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Get all users successfully",
      users: users,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const getDetailUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userServices.getDetailUser(userId);

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Get user info successfully",
      user: user,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// update user by ID for Admin
const updateUserByID = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedUser = await userServices.update(id, data);

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
    }

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Update successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// add favorite movie
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const movieData = req.body;

    const result = await userServices.toggleFavorite(userId, movieData);

    res.status(StatusCodes.OK).json({
      status: true,
      msg:
        result.status === "added"
          ? "Đã thêm vào yêu thích"
          : "Đã xóa khỏi yêu thích",
      result: result,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};
export const userController = {
  update,
  getAllUSers,
  getDetailUser,
  updateUserByID,
  toggleFavorite,
};
