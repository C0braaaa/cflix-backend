import Joi from "joi";
import { GET_DB } from "~/config/mongodb";

const BLOCKED_MOVIE_COLLECTION_NAME = "blocked_movies";

const BLOCKED_MOVIE_SCHEMA = Joi.object({
  slug: Joi.string().required().trim().strict(),
  name: Joi.string().required().trim().strict(),
  isBlocked: Joi.boolean().default(true),
  reason: Joi.string()
    .valid("inappropriate", "report", "copyright", "other")
    .default("other"),
  blockedBy: Joi.string().required().trim().strict(),
  blockedAt: Joi.date()
    .timestamp("javascript")
    .default(() => new Date()),
  updatedAt: Joi.date()
    .timestamp("javascript")
    .default(() => new Date()),
});

const blockMovie = async (slug, name, reason = "other", blockedBy) => {
  try {
    const db = await GET_DB();

    const result = await db
      .collection(BLOCKED_MOVIE_COLLECTION_NAME)
      .findOneAndUpdate(
        { slug },
        {
          $set: {
            slug,
            name,
            isBlocked: true,
            reason,
            blockedBy,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            blockedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" },
      );

    return result;
  } catch (error) {
    throw error;
  }
};

const unblockMovie = async (slug) => {
  try {
    const db = await GET_DB();

    const result = await db
      .collection(BLOCKED_MOVIE_COLLECTION_NAME)
      .findOneAndUpdate(
        { slug },
        { $set: { isBlocked: false, updatedAt: new Date() } },
        { returnDocument: "after" },
      );

    return result;
  } catch (error) {
    throw error;
  }
};

const checkIsBlocked = async (slug) => {
  try {
    const db = await GET_DB();

    const doc = await db
      .collection(BLOCKED_MOVIE_COLLECTION_NAME)
      .findOne({ slug }, { projection: { _id: 0, slug: 1, isBlocked: 1 } });

    return { isBlocked: doc?.isBlocked === true };
  } catch (error) {
    throw error;
  }
};

const getAllBlocked = async (page = 1, limit = 10) => {
  try {
    const db = await GET_DB();
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db
        .collection(BLOCKED_MOVIE_COLLECTION_NAME)
        .find({ isBlocked: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db
        .collection(BLOCKED_MOVIE_COLLECTION_NAME)
        .countDocuments({ isBlocked: true }),
    ]);

    return { items, total };
  } catch (error) {
    throw error;
  }
};

// Lấy tất cả slug đang bị khóa (để FE highlight ở bảng quản lý)
const getAllBlockedSlugs = async () => {
  try {
    const db = await GET_DB();
    const items = await db
      .collection(BLOCKED_MOVIE_COLLECTION_NAME)
      .find({ isBlocked: true }, { projection: { _id: 0, slug: 1 } })
      .toArray();
    return items.map((i) => i.slug);
  } catch (error) {
    throw error;
  }
};

export const blockedMovieModel = {
  BLOCKED_MOVIE_COLLECTION_NAME,
  BLOCKED_MOVIE_SCHEMA,
  blockMovie,
  unblockMovie,
  checkIsBlocked,
  getAllBlocked,
  getAllBlockedSlugs,
};
