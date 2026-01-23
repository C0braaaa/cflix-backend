import { userModels } from "~/models/userModels";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "~/config/environment";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import sendEmail from "~/utils/email";

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
    email.toLowerCase(),
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

const forgotPassword = async (email) => {
  try {
    const user = await userModels.findOneByEmail(email);
    if (!user) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "Email không tồn tại!",
      };
    } else if (!user.isActive) {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Tài khoản đã bị khóa!",
      };
    } else if (user._destroy) {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Tài khoản đã bị xóa!",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await userModels.updateUser(user._id, {
      passwordResetToken: passwordResetToken,
      passwordResetExpires: passwordResetExpires,
    });

    const resetUrl = `${env.CLIENT_URL}/quen-mat-khau?token=${resetToken}`;

    const message = `
   <p style-"margin: 13px">Xin chào <strong>${user.username}</strong>,</p>
   <p style-"margin: 13px">Chúng tôi đã nhận được yêu cầu thiết lập lại mật khẩu của bạn. Hãy nhấp vào liên kết bên dưới để thiết lập lại mật khẩu:</p>
   <a href="${resetUrl}">Thiết lập lại mật khẩu</a>
   <p style-"margin: 13px; font-weight: bold">Lưu ý:</p>
   <ul style="display: block;list-style-type: disc; margin-block-start: 1em; margin-block-end: 1em; padding-inline-start: 40px;
    unicode-bidi: isolate;">
      <li style="margin-left: 15px">Liên kết sẽ hết hạn trong vòng <strong>15 phút</strong> kể từ thời điểm yêu cầu.</li>
      <li style="margin-left: 15px">Nếu bạn không thiết lập lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn sẽ không có gì thay đổi.</li>
   </ul>
  `;

    await sendEmail({
      email: user.email,
      subject: "Cflix - Đặt lại mật khẩu",
      html: message,
    });

    return { message: "Hướng dẫn đặt lại mật khẩu đã được gửi về Email!" };
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (token, newPass) => {
  try {
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await userModels.findOneResetToken(passwordResetToken);

    if (!user) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "Token đã hết hạn hoặc không tồn tại!",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(newPass, salt);

    await userModels.updateUser(user._id, {
      password: hashPass,
      passwordResetToken: null,
      passwordResetExpires: null,
      updatedAt: new Date(),
    });

    return { message: "Đặt lại mật khẩu thành công!" };
  } catch (error) {
    throw error;
  }
};

const verifyTokenResetPass = async (token) => {
  try {
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await userModels.findOneResetToken(passwordResetToken);

    if (!user) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "Token đã hết hạn hoặc không tồn tại!",
      };
    }
    return { valid: true };
  } catch (error) {
    throw error;
  }
};

const changePassword = async (userId, currentPass, newPass) => {
  try {
    const user = await userModels.findUserWithPassword(userId);

    if (!user) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "Tài khoản không tồn tại!",
      };
    }

    if (!user.password) {
      throw {
        code: StatusCodes.BAD_REQUEST,
        message: "Tài khoản Google không thể đổi mật khẩu!",
      };
    }

    const isMatch = await bcrypt.compare(currentPass, user.password);

    if (!isMatch) {
      throw {
        code: StatusCodes.BAD_REQUEST,
        message: "Mật khẩu cũ không chính xác!",
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPass, salt);

    await userModels.updateUser(user._id, {
      password: hashPassword,
      updatedAt: new Date(),
    });

    return { message: "Đổi mật khẩu thành công!" };
  } catch (error) {
    throw error;
  }
};
export const authServices = {
  login,
  loginGoogle,
  register,
  forgotPassword,
  resetPassword,
  verifyTokenResetPass,
  changePassword,
};
