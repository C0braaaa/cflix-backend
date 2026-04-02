import { StatusCodes } from "http-status-codes";
import { blockedMovieService } from "~/services/blockedMovieService";

const blockMovie = async (req, res, next) => {
  try {
    const { slug, name, reason } = req.body;
    
    if (!slug || !name) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Thiếu slug hoặc tên phim!",
      });
    }

    const blockedBy = req.user.username;

    const result = await blockedMovieService.blockMovie(slug, name, reason || "other", blockedBy);
    
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Khóa phim thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const unblockMovie = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await blockedMovieService.unblockMovie(slug);
    
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Mở khóa phim thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const checkStatus = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await blockedMovieService.checkIsBlocked(slug);
    
    res.status(StatusCodes.OK).json({
      status: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBlocked = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await blockedMovieService.getAllBlocked(page, limit);
    
    res.status(StatusCodes.OK).json({
      status: true,
      data: result.items,
      pagination: {
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
        currentPage: page,
        limit,
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllBlockedSlugs = async (req, res, next) => {
  try {
    const slugs = await blockedMovieService.getAllBlockedSlugs();
    res.status(StatusCodes.OK).json({
      status: true,
      data: slugs,
    });
  } catch (error) {
    next(error);
  }
};

export const blockedMovieController = {
  blockMovie,
  unblockMovie,
  checkStatus,
  getAllBlocked,
  getAllBlockedSlugs,
};
