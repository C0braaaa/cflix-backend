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

// delete Slider
const deleteSlider = async (id) => {
  try {
    return await sliderModels.deleteSlider(id);
  } catch (error) {
    throw error;
  }
};

//update slider
const updateSlider = async (id, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    return await sliderModels.updateSlider(id, updateData);
  } catch (error) {
    throw error;
  }
};
export const sliderServices = {
  getAllSliders,
  createNewSlider,
  deleteSlider,
  updateSlider,
};
