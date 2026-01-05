import { authModels } from "~/models/authModels";
import jwt from "jsonwebtoken";
import { env } from "~/config/environment";
import { StatusCodes } from "http-status-codes";

const login = async (regBody) => {
  try {
    const existUser = await authModels.findOneByEmail(regBody.email);

    if (!existUser) {
      throw {
        code: StatusCodes.UNAUTHORIZED,
        message: "Mật khẩu hoặc email không chính xác!",
      };
    }

    // Check password
    if (existUser.password !== regBody.password) {
      throw {
        code: StatusCodes.UNAUTHORIZED,
        message: "Mật khẩu hoặc email không chính xác!",
      };
    }

    // Create token
    const userInfo = {
      _id: existUser._id,
      name: existUser.name,
      email: existUser.email,
      role: existUser.role,
      avatar_url: existUser.avatar_url,
      gender: existUser.gender,
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

export const authServices = {
  login,
};
