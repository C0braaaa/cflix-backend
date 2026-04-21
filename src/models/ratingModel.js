import Joi from "joi";
import { GET_DB } from "~/config/mongodb";

const RATING_COLLECTION_NAME = "ratings";

const RATING_SCHEMA = Joi.object({
  slug: Joi.string().required().trim(),
  name: Joi.string().required().trim(),
  poster_url: Joi.string().required().trim(),
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
const updateLikes = async (slug, userId, action, name, poster_url) => {
  const db = await GET_DB();
  let updateQuery = {};

  if (action === "add") {
    updateQuery = {
      $addToSet: { likes: userId },
      $pull: { dislikes: userId },
      $set: { updated_at: new Date() },
      $setOnInsert: { name, poster_url },
    };
  } else {
    updateQuery = {
      $pull: { likes: userId },
      $set: { updated_at: new Date() },
      $setOnInsert: { name, poster_url },
    };
  }

  return await db
    .collection(RATING_COLLECTION_NAME)
    .updateOne({ slug: slug }, updateQuery, { upsert: true });
};

// update dislikes
const updateDislikes = async (slug, userId, action, name, poster_url) => {
  const db = await GET_DB();
  let updateQuery = {};

  if (action === "add") {
    updateQuery = {
      $addToSet: { dislikes: userId },
      $pull: { likes: userId },
      $set: { updated_at: new Date() },
      $setOnInsert: { name, poster_url },
    };
  } else {
    updateQuery = {
      $pull: { dislikes: userId },
      $set: { updated_at: new Date() },
      $setOnInsert: { name, poster_url },
    };
  }

  return await db
    .collection(RATING_COLLECTION_NAME)
    .updateOne({ slug: slug }, updateQuery, { upsert: true });
};

const getTopLiked = async () => {
  const db = await GET_DB();
  return await db
    .collection(RATING_COLLECTION_NAME)
    .aggregate([
      {
        $project: {
          slug: 1,
          name: 1,
          poster_url: 1,
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      { $sort: { likesCount: -1 } },
      { $limit: 10 },
    ])
    .toArray();
};

export const ratingModel = {
  RATING_COLLECTION_NAME,
  RATING_SCHEMA,
  createCollection,
  findBySlug,
  updateLikes,
  updateDislikes,
  getTopLiked,
};
