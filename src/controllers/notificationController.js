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

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    await notificationServices.markAsRead(id, userId);
    res.status(StatusCodes.OK).json({ message: "Đánh dấu đã đọc!" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await notificationServices.markAllAsRead(userId);
    res.status(StatusCodes.OK).json({ message: "Đã đánh dấu đọc tất cả!" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

const deleteNotify = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    await notificationServices.deleteNotify(id, userId);

    res.status(StatusCodes.OK).json({ message: "Xóa thông báo thành công!" });
  } catch (error) {
    res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};
export const notificationCotroller = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotify,
};
