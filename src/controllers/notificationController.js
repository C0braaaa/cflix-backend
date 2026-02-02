import { notificationServices } from "~/services/notificationService";
import { StatusCodes } from "http-status-codes";

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await notificationServices.getMyNotifications(userId);

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Lấy thông báo thành công!",
      data: result,
    });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const notificationCotroller = {
  getMyNotifications,
};
