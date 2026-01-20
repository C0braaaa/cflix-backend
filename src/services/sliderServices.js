import { sliderModels } from "~/models/sliderModel";

const getAllSliders = async () => {
  try {
    const sliders = await sliderModels.getSliders();
    return sliders;
  } catch (error) {
    throw error;
  }
};

// add new slider
const createNewSlider = async (data) => {
  try {
    const slideData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await sliderModels.createNewSLider(slideData);
  } catch (error) {}
};
export const sliderServices = {
  getAllSliders,
  createNewSlider,
};
