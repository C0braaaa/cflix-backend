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
        { returnDocument: "after" },
      );
    return result;
  } catch (error) {
    throw error;
  }
};

// get all users
const getAllUsers = async ({ keyword, role, is_active }) => {
  try {
    const query = {
      _destroy: false,
    };

    // if (currentId) {
    //   query._id = { $ne: new ObjectId(currentId) };
    // }

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

    const total = await db
      .collection(USER_COLLECTION_NAME)
      .countDocuments(query);
    return { users, total };
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

// delete user (soft delete)
const deleteUser = async (id) => {
  try {
    const db = await GET_DB();

    const result = await db
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true, updatedAt: new Date() } },
        { returnDocument: "after" },
      );
    return result;
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
  deleteUser,
  findOneResetToken,
};
