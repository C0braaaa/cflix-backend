import { userModels } from "~/models/userModels";
import jwt from "jsonwebtoken";
import { env } from "~/config/environment";
import { StatusCodes } from "http-status-codes";

//update profile
const update = async (userId, regBody) => {
  try {
    const updateData = {
      username: regBody.username,
      gender: regBody.gender,
      avatar_url: regBody.avatar_url,
      role: regBody.role,
      isActive: regBody.isActive,
    };

    // loc bo nhung truong undefined
    Object.keys(updateData).forEach((key) => {
      updateData[key] === undefined && delete updateData[key];
    });

    //Goi model update
    const updatedUser = await userModels.updateUser(userId, updateData);

    if (updateData) delete updateData.password;

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// get all users
const getAllUSers = async (filters) => {
  try {
    const users = await userModels.getAllUsers(filters);
    return users;
  } catch (error) {
    throw error;
  }
};

const getDetailUser = async (userId) => {
  try {
    const user = await userModels.findOneById(userId);

    if (!user) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "User not found",
      };
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// add favorite movie
const toggleFavorite = async (userId, movieData) => {
  try {
    const rs = await userModels.toggleFavorite(userId, movieData);
    return rs;
  } catch (error) {
    throw error;
  }
};

const togglePlaylist = async (userId, movieData) => {
  try {
    const rs = await userModels.togglePlaylist(userId, movieData);
    return rs;
  } catch (error) {}
};

const saveProgress = async (userId, movieData) => {
  try {
    const rs = await userModels.updateContinueWatching(userId, movieData);
    return rs;
  } catch (error) {
    throw error;
  }
};

const removeContinueWatching = async (userId, movileSlug) => {
  return await userModels.removeContinueWatching(userId, movileSlug);
};

const deleteUser = async (userId) => {
  try {
    const existUser = await userModels.findOneById(userId);

    if (!existUser) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "User khong ton tai!",
      };
    }
    if (existUser.role === "admin") {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Khong the xoa tai khoan admin!",
      };
    }

    const rs = await userModels.deleteUser(userId);
    return rs;
  } catch (error) {
    throw error;
  }
};
// pagination for favorite, palylist and continue watching
const getFavorites = async (userId, { page = 1, limit = 18 }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 18;

  const result = await userModels.getListPagination(
    userId,
    "favorite",
    pageNum,
    limitNum
  );
  return {
    items: result.data,
    totalItems: result.total,
    currentPage: pageNum,
    totalPages: Math.ceil(result.total / limitNum),
  };
};

const getPlaylist = async (userId, { page = 1, limit = 18 }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 18;

  const result = await userModels.getListPagination(
    userId,
    "playlist",
    pageNum,
    limitNum
  );
  return {
    items: result.data,
    totalItems: result.total,
    currentPage: pageNum,
    totalPages: Math.ceil(result.total / limitNum),
  };
};

const getContinueWatching = async (userId, { page = 1, limit = 18 }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 18;

  const result = await userModels.getListPagination(
    userId,
    "continue_watching",
    pageNum,
    limitNum
  );
  return {
    items: result.data,
    totalItems: result.total,
    currentPage: pageNum,
    totalPages: Math.ceil(result.total / limitNum),
  };
};
export const userServices = {
  update,
  getAllUSers,
  getDetailUser,
  toggleFavorite,
  togglePlaylist,
  saveProgress,
  removeContinueWatching,
  deleteUser,
  getFavorites,
  getPlaylist,
  getContinueWatching,
};
