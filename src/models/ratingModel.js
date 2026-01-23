import Joi from "joi";
import { GET_DB } from "~/config/mongodb";

const RATING_COLLECTION_NAME = "ratings";

const RATING_SCHEMA = Joi.object({
  slug: Joi.string().required(),
  likes: Joi.array().items(Joi.string()).default([]),
  dislikes: Joi.array().items(Joi.string()).default([]),
  updated_at: Joi.date().timestamp("javascript").default(new Date()),
});

// create collection
const createCollection = async () => {
  const db = await GET_DB();
  await db
    .collection(RATING_COLLECTION_NAME)
    .createIndex({ slug: 1 }, { unique: true });
};

const findBySlug = async (slug) => {
  const db = await GET_DB();
  return await db.collection(RATING_COLLECTION_NAME).findOne({ slug: slug });
};

// update likes
const updateLikes = async (slug, userId, action) => {
  const db = await GET_DB();
  let updateQuery = {};

  if (action === "add") {
    updateQuery = {
      $addToSet: { likes: userId },
      $pull: { dislikes: userId },
      $set: { updated_at: new Date() },
    };
  } else {
    updateQuery = {
      $pull: { likes: userId },
      $set: { updated_at: new Date() },
    };
  }

  return await db
    .collection(RATING_COLLECTION_NAME)
    .updateOne({ slug: slug }, updateQuery, { upsert: true });
};

// update dislikes
const updateDislikes = async (slug, userId, action) => {
  const db = await GET_DB();
  let updateQuery = {};

  if (action === "add") {
    updateQuery = {
      $addToSet: { dislikes: userId },
      $pull: { likes: userId },
      $set: { updated_at: new Date() },
    };
  } else {
    updateQuery = {
      $pull: { dislikes: userId },
      $set: { updated_at: new Date() },
    };
  }

  return await db
    .collection(RATING_COLLECTION_NAME)
    .updateOne({ slug: slug }, updateQuery, { upsert: true });
};
export const ratingModel = {
  RATING_COLLECTION_NAME,
  RATING_SCHEMA,
  createCollection,
  findBySlug,
  updateLikes,
  updateDislikes,
};
