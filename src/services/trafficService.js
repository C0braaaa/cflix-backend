import { trafficModel } from "~/models/trafficModel";

const recordVisit = async () => {
  try {
    return await trafficModel.recordVisit();
  } catch (error) {
    throw error;
  }
};

const getTrafficStats = async (limit) => {
  try {
    return await trafficModel.getTrafficStats(limit);
  } catch (error) {
    throw error;
  }
};

export const trafficService = { recordVisit, getTrafficStats };
