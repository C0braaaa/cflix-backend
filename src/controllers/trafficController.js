import { trafficService } from "~/services/trafficService";
import { StatusCodes } from "http-status-codes";

const recordVisit = async (req, res, next) => {
  try {
    await trafficService.recordVisit();
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

    const todayStr = today.toISOString().slice(0, 10);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

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
      return { date: displayDate, views: item.views };
    });

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Lấy thống kê truy cập thành công!",
      data: {
        chartData,
        trafficHighestInDay: result.trafficHighestInDay,
        totalViews: result.totalViews,
        previousViews: result.previousViews,
        growthRate: result.growthRate,
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
