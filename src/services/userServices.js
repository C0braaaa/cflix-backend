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
export const userServices = {
  update,
  getAllUSers,
  getDetailUser,
  toggleFavorite,
};
