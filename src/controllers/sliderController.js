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

export const sliderController = { getAllSliders };
