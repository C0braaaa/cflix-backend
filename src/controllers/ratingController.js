import { ratingServices } from "~/services/ratingServices";
import { StatusCodes } from "http-status-codes";

const toggleLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slug } = req.body;
    const result = await ratingServices.toggleLike(slug, userId);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: result.msg,
      ...result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const toggleDislike = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slug } = req.body;
    const result = await ratingServices.toggleDislike(slug, userId);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: result.msg,
      ...result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const getRating = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const { slug } = req.params;

    const result = await ratingServices.getRating(slug, userId);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Get rating successfully",
      data: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const ratingController = {
  toggleLike,
  toggleDislike,
  getRating,
};
