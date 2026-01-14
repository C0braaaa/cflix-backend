import { userModels } from "~/models/userModels";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "~/config/environment";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

//login google
const loginGoogle = async (credential) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    let user = await userModels.findOneByEmail(email);

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = {
        username: name,
        email: email,
        password: hashPassword,
        avatar_url: picture,
        role: "user",
        gender: "unknown",
        isActive: true,
        authType: "google",
        playlist: [],
        continue_watching: [],
        favorite: [],
        createdAt: Date.now(),
        updatedAt: null,
      };

      user = await userModels.createNewUser(newUser);
    } else if (user._destroy) {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Tài khoản đã bị xóa",
      };
    } else if (!user.isActive) {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Tài khoản đã bị khóa",
      };
    }

    const userInfo = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      gender: user.gender || "unknown",
      avatar_url: user.avatar_url,
      isActive: user.isActive,
    };

    const accessToken = jwt.sign(userInfo, env.JWT_SECRET, { expiresIn: "1d" });

    return {
      accessToken,
      data: userInfo,
    };
  } catch (error) {
    throw error;
  }
};
// login
const login = async (regBody) => {
  try {
    const existUser = await userModels.findOneByEmail(regBody.email);

    if (!existUser) {
      throw {
        code: StatusCodes.UNAUTHORIZED,
        message: "Mật khẩu hoặc email không chính xác!",
      };
    }

    if (existUser._destroy) {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Tài khoản đã bị xóa",
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
      // playlist: existUser.playlist,
      // continue_watching: existUser.continue_watching,
      // favorite: existUser.favorite,
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
    const existingUSer = await userModels.findOneByEmail(reqBody.email);
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

    const createNewUser = await userModels.createNewUser(newUser);

    return createNewUser;
  } catch (error) {}
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
export const authServices = {
  login,
  loginGoogle,
  register,
  togglePlaylist,
  saveProgress,
  removeContinueWatching,
  deleteUser,
  getFavorites,
  getPlaylist,
  getContinueWatching,
};
