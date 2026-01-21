import Joi from "joi";
import { GET_DB } from "~/config/mongodb";
import { ObjectId } from "mongodb";

const COMMENT_COLLECTION_NAME = "comments";

const COMMENT_SCHEMA = Joi.object({
  user_id: Joi.string().required(),
  username: Joi.string().required(),
  user_avatar: Joi.string().allow("").default(""),
  user_role: Joi.string().default("user"),
  gender: Joi.string().valid("male", "female", "unknown"),
  movie_slug: Joi.string().required(),
  content: Joi.string().required().trim(),
  parent_id: Joi.string().allow(null).default(null),
  likes: Joi.array().items(Joi.string()).default([]),
  dislikes: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date()
    .timestamp("javascript")
    .default(() => new Date()),
  updatedAt: Joi.date()
    .timestamp("javascript")
    .default(() => new Date()),
});

// add comment
const addComment = async (data) => {
  try {
    const validData = await COMMENT_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const db = await GET_DB();
    const result = await db
      .collection(COMMENT_COLLECTION_NAME)
      .insertOne(validData);

    return await db
      .collection(COMMENT_COLLECTION_NAME)
      .findOne({ _id: result.insertedId });
  } catch (error) {
    throw error;
  }
};

// get comment
const getCommentBySlug = async (slug) => {
  try {
    const db = await GET_DB();
    return await db
      .collection(COMMENT_COLLECTION_NAME)
      .find({ movie_slug: slug })
      .sort({ user_role: 1, createdAt: -1 })
      .limit(50)
      .toArray();
  } catch (error) {
    throw error;
  }
};

// vote comment (like/dislike)
const toggleVoteComment = async (commentId, userId, type) => {
  try {
    const db = await GET_DB();
    const comment = await db
      .collection(COMMENT_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(commentId) });
    if (!comment) throw new Error("Comment not found");

    const isLiked = comment.likes?.includes(userId);
    const isDisLiked = comment.dislikes?.includes(userId);

    let updateQuery = {};

    if (type === "like") {
      if (isLiked) {
        updateQuery = { $pull: { likes: userId } };
      } else {
        updateQuery = {
          $addToSet: { likes: userId },
          $pull: { dislikes: userId },
        };
      }
    } else if (type === "dislike") {
      if (isDisLiked) {
        updateQuery = { $pull: { dislikes: userId } };
      } else {
        updateQuery = {
          $addToSet: { dislikes: userId },
          $pull: { likes: userId },
        };
      }
    }

    return await db.collection(COMMENT_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(commentId),
      },
      updateQuery,
      { returnDocument: "after" },
    );
  } catch (error) {
    throw error;
  }
};

// get comment by ID
const getCommentById = async (id) => {
  try {
    const db = await GET_DB();
    return await db
      .collection(COMMENT_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw error;
  }
};

// delete comment
const deleteComment = async (id) => {
  try {
    const db = await GET_DB();
    return await db
      .collection(COMMENT_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw error;
  }
};
export const commentModel = {
  COMMENT_COLLECTION_NAME,
  COMMENT_SCHEMA,
  addComment,
  getCommentBySlug,
  toggleVoteComment,
  getCommentById,
  deleteComment,
};
