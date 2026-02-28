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
  } catch (error) {
    throw error;
  }
};

const getTrafficStats = async (limit = 7) => {
  try {
    const db = await GET_DB();

    const [stats, highestTraffic] = await Promise.all([
      db
        .collection(TRAFFIC_COLLECTION_NAME)
        .find({})
        .sort({ date: -1 })
        .limit(limit)
        .toArray(),

      db
        .collection(TRAFFIC_COLLECTION_NAME)
        .find({})
        .sort({ views: -1 })
        .limit(1)
        .toArray(),
    ]);

    return {
      stats: stats.reverse(),
      trafficHighestInDay: highestTraffic.length > 0 ? highestTraffic[0] : null,
    };
  } catch (error) {
    throw error;
  }
};

export const trafficModel = { recordVisit, getTrafficStats };
