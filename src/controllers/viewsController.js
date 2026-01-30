import { viewsServices } from "~/services/viewsService";
import { StatusCodes } from "http-status-codes";

const increaseView = async (req, res) => {
  try {
    const { slug, type, name, origin_name, poster_url } = req.body;
    if (!slug) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Thieu slug",
      });
    }
    await viewsServices.increaseView({
      slug,
      type,
      name,
      origin_name,
      poster_url,
    });
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Da tang luot xem!",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

const getTopViewed = async (req, res) => {
  try {
    const { type } = req.query;
    const topMovies = await viewsServices.getTopViewed(type);
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Lay danh sach trending thanh cong! ",
      data: topMovies,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

export const viewsController = {
  increaseView,
  getTopViewed,
};
