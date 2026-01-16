import Joi from "joi";
import { GET_DB } from "~/config/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

const USER_COLLECTION_NAME = "users";

//  Schema
const USER_SCHEMA = Joi.object({
  email: Joi.string().required().email().trim().strict(),
  password: Joi.string().required().min(6).trim().strict(),
  username: Joi.string().required().min(6).max(30).trim().strict(),
  role: Joi.string().valid("user", "admin").default("user"),
  avatar_url: Joi.string().uri().optional(),
  gender: Joi.string().valid("male", "female", "unknown").default("unknown"),
  isActive: Joi.boolean().default(true),
  authType: Joi.string().valid("local", "google").default("local"),
  playlist: Joi.array().items(Joi.object()).default([]),
  continue_watching: Joi.array().items(Joi.object()).default([]),
  favorite: Joi.array().items(Joi.object()).default([]),
  createdAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  updatedAt: Joi.date().timestamp("javascript").allow(null).default(null),
  passwordResetToken: Joi.string(),
  passwordResetExpires: Joi.date(),
  _destroy: Joi.boolean().default(false),
});

// login findOneByEmail
const findOneByEmail = async (email) => {
  try {
    const db = await GET_DB();
    const user = await db
      .collection(USER_COLLECTION_NAME)
      .findOne({ email: email });
    return user;
  } catch (error) {
    throw error;
  }
};

// create new user/ register
const createNewUser = async (user) => {
  try {
    const valiData = await USER_SCHEMA.validateAsync(user, {
      abortEarly: false,
    });
    const db = await GET_DB();
    const result = await db
      .collection(USER_COLLECTION_NAME)
      .insertOne(valiData);

    return await db
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: result.insertedId });
  } catch (error) {
    throw error;
  }
};

// update user
const updateUser = async (id, data) => {
  try {
    const db = await GET_DB();
    if (data._id) delete data._id;

    const updateData = { ...data, updatedAt: new Date() };

    const result = await db
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
    return result;
  } catch (error) {
    throw error;
  }
};

// get all users
const getAllUsers = async ({ keyword, role, is_active, currentId }) => {
  try {
    const query = {
      _destroy: false,
    };

    if (currentId) {
      query._id = { $ne: new ObjectId(currentId) };
    }

    if (keyword) {
      const regex = { $regex: keyword, $options: "i" };

      query.$or = [{ username: regex }, { email: regex }];
    }
    if (role) {
      query.role = role;
    }

    if (is_active !== undefined) {
      query.isActive = is_active === "true";
    }

    const db = await GET_DB();
    const users = await db
      .collection(USER_COLLECTION_NAME)
      .find(query)
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return users;
  } catch (error) {
    throw error;
  }
};

const findOneById = async (id) => {
  try {
    const db = await GET_DB();
    const user = await db
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
    return user;
  } catch (error) {
    throw error;
  }
};

// find user with pass
const findUserWithPassword = async (id) => {
  try {
    const db = await GET_DB();
    const user = await db.collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
    });
    return user;
  } catch (error) {
    throw error;
  }
};

// add favorite movie
const toggleFavorite = async (userId, movieData) => {
  try {
    const db = await GET_DB();
    const user = await db.collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(userId),
    });

    const isExist = user.favorite.find((item) => item.slug === movieData.slug);

    if (isExist) {
      await db
        .collection(USER_COLLECTION_NAME)
        .updateOne(
          { _id: new ObjectId(userId) },
          { $pull: { favorite: { slug: movieData.slug } } }
        );
      return { status: "removed", slug: movieData.slug };
    } else {
      const newItem = {
        id: new ObjectId(),
        slug: movieData.slug,
        name: movieData.name,
        origin_name: movieData.origin_name,
        poster_url: movieData.poster_url,
      };
      await db.collection(USER_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            favorite: {
              $each: [newItem],
              $position: 0,
            },
          },
        }
      );

      return { status: "added", newItem };
    }
  } catch (error) {
    throw error;
  }
};

const togglePlaylist = async (userId, movieData) => {
  try {
    const db = await GET_DB();
    const user = await db.collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(userId),
    });

    const exist = user.playlist.find((item) => item.slug === movieData.slug);

    if (exist) {
      await db.collection(USER_COLLECTION_NAME).updateOne(
        {
          _id: new ObjectId(userId),
        },
        {
          $pull: { playlist: { slug: movieData.slug } },
        }
      );
      return { status: "removed", slug: movieData.slug };
    } else {
      const newItem = {
        id: new ObjectId(),
        slug: movieData.slug,
        name: movieData.name,
        origin_name: movieData.origin_name,
        poster_url: movieData.poster_url,
      };
      await db.collection(USER_COLLECTION_NAME).updateOne(
        {
          _id: new ObjectId(userId),
        },
        {
          $push: {
            playlist: {
              $each: [newItem],
              $position: 0,
            },
          },
        }
      );
      return { status: "added", newItem };
    }
  } catch (error) {
    throw error;
  }
};

const updateContinueWatching = async (userId, movieData) => {
  try {
    const db = await GET_DB();
    await db
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { continue_watching: { slug: movieData.slug } } }
      );

    const newItem = {
      ...movieData,
      updatedAt: new Date(),
    };

    const result = await db.collection(USER_COLLECTION_NAME).updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          continue_watching: {
            $each: [newItem],
            $position: 0,
          },
        },
      }
    );

    return result;
  } catch (error) {
    throw error;
  }
};

const removeContinueWatching = async (userId, movileSlug) => {
  try {
    const db = await GET_DB();
    const result = await db.collection(USER_COLLECTION_NAME).updateOne(
      {
        _id: new ObjectId(userId),
      },
      { $pull: { continue_watching: { slug: movileSlug } } }
    );
    return result;
  } catch (error) {
    throw error;
  }
};

// delete user (soft delete)
const deleteUser = async (id) => {
  try {
    const db = await GET_DB();

    const result = await db
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
    return result;
  } catch (error) {
    throw error;
  }
};

// pagination
const getListPagination = async (userId, field, page, limit) => {
  try {
    const db = await GET_DB();
    const skip = (page - 1) * limit;

    const user = await db
      .collection(USER_COLLECTION_NAME)
      .aggregate([
        { $match: { _id: new ObjectId(userId) } },

        {
          $project: {
            _id: 0,
            total: { $size: { $ifNull: [`$${field}`, []] } },
            data: { $slice: [{ $ifNull: [`$${field}`, []] }, skip, limit] },
          },
        },
      ])
      .toArray();

    return user[0] || { total: 0, data: [] };
  } catch (error) {
    throw error;
  }
};

const findOneResetToken = async (token) => {
  try {
    const db = await GET_DB();
    const user = await db.collection(USER_COLLECTION_NAME).findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    return user;
  } catch (error) {
    throw error;
  }
};
export const userModels = {
  USER_COLLECTION_NAME,
  USER_SCHEMA,
  findOneByEmail,
  findOneById,
  findUserWithPassword,
  createNewUser,
  updateUser,
  getAllUsers,
  toggleFavorite,
  togglePlaylist,
  updateContinueWatching,
  removeContinueWatching,
  deleteUser,
  getListPagination,
  findOneResetToken,
};
