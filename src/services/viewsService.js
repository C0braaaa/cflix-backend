import { viewsModel } from "~/models/viewsModel";

const increaseView = async (data) => {
  try {
    const res = await viewsModel.increaseView(data);
    return res;
  } catch (error) {
    throw error;
  }
};

const getTopViewed = async (type) => {
  try {
    const res = await viewsModel.getTopViewed(10, type);
    return res;
  } catch (error) {
    throw error;
  }
};

export const viewsServices = {
  increaseView,
  getTopViewed,
};
