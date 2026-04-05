import { blockedMovieModel } from "~/models/blockedMovieModel";

const blockMovie = async (slug, name, origin_name, type, poster_url) => {
  return await blockedMovieModel.blockMovie(
    slug,
    name,
    origin_name,
    type,
    poster_url,
  );
};

const unblockMovie = async (slug) => {
  return await blockedMovieModel.unblockMovie(slug);
};

const checkIsBlocked = async (slug) => {
  return await blockedMovieModel.checkIsBlocked(slug);
};

const getAllBlocked = async (page, limit) => {
  return await blockedMovieModel.getAllBlocked(page, limit);
};

const getAllBlockedSlugs = async () => {
  return await blockedMovieModel.getAllBlockedSlugs();
};

export const blockedMovieService = {
  blockMovie,
  unblockMovie,
  checkIsBlocked,
  getAllBlocked,
  getAllBlockedSlugs,
};
