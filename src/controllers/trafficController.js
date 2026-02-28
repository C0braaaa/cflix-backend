import { trafficService } from "~/services/trafficService";
import { StatusCodes } from "http-status-codes";

const recordVisit = async (req, res, next) => {
  try {
    await trafficService.recordVisit();

    // API này gọi ngầm nên chỉ cần trả về OK là được
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Ghi nhận truy cập thành công!",
    });
  } catch (error) {
    next(error);
  }
};

const getTrafficStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const result = await trafficService.getTrafficStats(days);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const chartData = result.stats.map((item) => {
      let displayDate = "";
      if (item.date === todayStr) {
        displayDate = "Hôm nay";
      } else if (item.date === yesterdayStr) {
        displayDate = "Hôm qua";
      } else {
        const [year, month, day] = item.date.split("-");
        displayDate = `${day}/${month}`;
      }

      return {
        date: displayDate,
        views: item.views,
      };
    });

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Lấy thống kê truy cập thành công!",
      data: {
        chartData: chartData,
        trafficHighestInDay: result.trafficHighestInDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const trafficController = {
  recordVisit,
  getTrafficStats,
};
