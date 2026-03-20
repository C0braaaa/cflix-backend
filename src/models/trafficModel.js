import { GET_DB } from "~/config/mongodb";

const TRAFFIC_COLLECTION_NAME = "traffics";

const recordVisit = async () => {
  try {
    const db = await GET_DB();
    const dateObj = new Date();
    const today = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    const result = await db
      .collection(TRAFFIC_COLLECTION_NAME)
      .findOneAndUpdate(
        { date: today },
        { $inc: { views: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    return result;
  } catch (error) {
    throw error;
  }
};

// Helper: tính date string offset N ngày từ hôm nay
const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

const getTrafficStats = async (limit = 7) => {
  try {
    const db = await GET_DB();

    const startA = getDateStr(limit);
    const startB = getDateStr(limit * 2);

    const [stats, highestTraffic, previousResult] = await Promise.all([
      db
        .collection(TRAFFIC_COLLECTION_NAME)
        .find({ date: { $gte: startA } })
        .sort({ date: -1 })
        .limit(limit)
        .toArray(),

      db
        .collection(TRAFFIC_COLLECTION_NAME)
        .find({})
        .sort({ views: -1 })
        .limit(1)
        .toArray(),

      db
        .collection(TRAFFIC_COLLECTION_NAME)
        .aggregate([
          { $match: { date: { $gte: startB, $lt: startA } } },
          { $group: { _id: null, total: { $sum: "$views" } } },
        ])
        .toArray(),
    ]);

    const totalViews = stats.reduce((sum, item) => sum + item.views, 0);
    const previousViews = previousResult[0]?.total || 0;

    const growthRate =
      previousViews > 0
        ? parseFloat(
            (((totalViews - previousViews) / previousViews) * 100).toFixed(1),
          )
        : null;

    return {
      stats: stats.reverse(),
      trafficHighestInDay: highestTraffic[0] ?? null,
      totalViews,
      previousViews,
      growthRate,
    };
  } catch (error) {
    throw error;
  }
};

export const trafficModel = { recordVisit, getTrafficStats };
