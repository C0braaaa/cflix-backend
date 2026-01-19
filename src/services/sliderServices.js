import { sliderModels } from "~/models/sliderModel";

const getAllSliders = async () => {
  try {
    const sliders = await sliderModels.getSliders();
    return sliders;
  } catch (error) {
    throw error;
  }
};

export const sliderServices = {
  getAllSliders,
};
