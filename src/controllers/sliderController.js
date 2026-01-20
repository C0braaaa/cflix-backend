import { sliderServices } from "~/services/sliderServices";
import { StatusCodes } from "http-status-codes";

const getAllSliders = async (req, res) => {
  try {
    const sliders = await sliderServices.getAllSliders();

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Get all sliders successfully",
      data: sliders,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// add new slider
const createNewSlider = async (req, res) => {
  try {
    const newSlider = await sliderServices.createNewSlider(req.body);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Create new slider successfully",
      data: newSlider,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// delete slider
const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    await sliderServices.deleteSlider(id);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Delete slider successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// update slider
const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = await sliderServices.updateSlider(id, req.body);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Update slider successfully",
      data: updateData,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const sliderController = {
  getAllSliders,
  createNewSlider,
  deleteSlider,
  updateSlider,
};
