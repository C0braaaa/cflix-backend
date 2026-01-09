import { authModels } from "~/models/authModels";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "~/config/environment";
import { StatusCodes } from "http-status-codes";

// login
const login = async (regBody) => {
  try {
    const existUser = await authModels.findOneByEmail(regBody.email);

    if (!existUser) {
      throw {
        code: StatusCodes.UNAUTHORIZED,
        message: "Mật khẩu hoặc email không chính xác!",
      };
    }

    if (!existUser.isActive) {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Tài khoản đã bị khóa",
      };
    }
    // Check password
    const isMatch = await bcrypt.compare(regBody.password, existUser.password);
    if (!isMatch) {
      throw {
        code: StatusCodes.UNAUTHORIZED,
        message: "Mật khẩu hoặc email không chính xác!",
      };
    }

    // Create token
    const userInfo = {
      _id: existUser._id,
      username: existUser.username,
      email: existUser.email,
      role: existUser.role,
      avatar_url: existUser.avatar_url,
      gender: existUser.gender,
      isActive: existUser.isActive,
      playlist: existUser.playlist,
      continue_watching: existUser.continue_watching,
      favorite: existUser.favorite,
      createAt: existUser.createdAt,
      updateAt: existUser.updatedAt,
    };

    // Delete token after 1 day
    const accessToken = jwt.sign(userInfo, env.JWT_SECRET, { expiresIn: "1d" });

    // delete password before return to client
    delete existUser.password;

    return {
      accessToken,
      data: userInfo,
    };
  } catch (error) {
    throw error;
  }
};

// generate avatar
const generateAvatar = (email) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    email.toLowerCase()
  )}`;
};

// register
const register = async (reqBody) => {
  try {
    // check exsisting email
    const existingUSer = await authModels.findOneByEmail(reqBody.email);
    if (existingUSer) {
      throw {
        code: StatusCodes.CONFLICT,
        message: "Email đã tồn tại",
      };
    }

    // hash pass
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(reqBody.password, salt);

    // create new user
    const avatar_url = generateAvatar(reqBody.email);
    const newUser = {
      username: reqBody.username,
      email: reqBody.email,
      password: hashPassword,
      avatar_url: avatar_url,
      role: "user",
      gender: "unknown",
      isActive: true,
      playlist: [],
      continue_watching: [],
      favorite: [],
      createdAt: Date.now(),
      updatedAt: null,
    };

    const createNewUser = await authModels.createNewUser(newUser);

    return createNewUser;
  } catch (error) {}
};

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
    const updatedUser = await authModels.updateUser(userId, updateData);

    if (updateData) delete updateData.password;

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const getAllUSers = async (filters) => {
  try {
    const users = await authModels.getAllUsers(filters);
    return users;
  } catch (error) {
    throw error;
  }
};

const getDetailUser = async (userId) => {
  try {
    const user = await authModels.findOneById(userId);

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
    const rs = await authModels.toggleFavorite(userId, movieData);
    return rs;
  } catch (error) {
    throw error;
  }
};
export const authServices = {
  login,
  register,
  update,
  getDetailUser,
  getAllUSers,
  toggleFavorite,
};
