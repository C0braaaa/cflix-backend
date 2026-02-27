import { reportService } from "~/services/reportService";
import { StatusCodes } from "http-status-codes";

const createReport = async (req, res, next) => {
  try {
    const reporter_id = req.user._id.toString();
    const reporter_name = req.user.username;

    if (!req.body.reason || req.body.reason.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Vui lòng chọn lý do!",
      });
    }
    const reportData = {
      ...req.body,
      reporter_id: reporter_id,
      reporter_name: reporter_name,
    };
    const result = await reportService.createReport(reportData);
    res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Gửi báo cáo thành công! Quản trị viên sẽ sớm xử lí!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { type, status } = req.query;

    const result = await reportService.getAllReports({
      type,
      status,
      page,
      limit,
    });

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Lấy danh sách báo cáo thành công",
      data: result.reports,
      pagination: {
        totalItems: result.totalFilters,
        totalPages: Math.ceil(result.totalFilters / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReportStats = async (req, res, next) => {
  try {
    const stats = await reportService.getReportStats();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Lấy thống kê báo cáo thành công",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await reportService.deleteReport(id);

    // Kiểm tra xem có document nào bị xóa không
    if (result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Không tìm thấy phản hồi này hoặc đã bị xóa trước đó.",
      });
    }

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Xóa phản hồi thành công",
    });
  } catch (error) {
    next(error);
  }
};

const upadteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Trạng thái không hợp lệ!",
      });
    }

    const updatedReport = await reportService.updateStatus(id, status);

    if (!updatedReport) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Không tìm thấy phản hồi này!",
      });
    }

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Cập nhật trạng thái thành công!",
      data: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

export const reportController = {
  createReport,
  getAllReports,
  getReportStats,
  deleteReport,
  upadteStatus,
};
