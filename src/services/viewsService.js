import { viewsModel } from "~/models/viewsModel";

const increaseView = async (data) => {
  try {
    const res = await viewsModel.increaseView(data);
    return res;
  } catch (error) {
    throw error;
  }
};

const getTopViewed = async (page, limit, type) => {
  try {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const res = await viewsModel.getTopViewed({
      page: pageNum,
      limit: limitNum,
      type,
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const viewsServices = {
  increaseView,
  getTopViewed,
};
