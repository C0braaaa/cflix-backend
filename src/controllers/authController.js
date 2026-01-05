import { StatusCodes } from "http-status-codes";
import { authServices } from "~/services/authServices";

const login = async (req, res) => {
  try {
    const result = await authServices.login(req.body);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.log("🔥 Lỗi chi tiết:", error);
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const authController = {
  login,
};
