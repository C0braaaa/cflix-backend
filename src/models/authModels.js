import Joi from "joi";
import { GET_DB } from "~/config/mongodb";

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
  playlist: Joi.array().items(Joi.object()).default([]),
  continue_watching: Joi.array().items(Joi.object()).default([]),
  favorite: Joi.array().items(Joi.object()).default([]),
  createdAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  updatedAt: Joi.date().timestamp("javascript").allow(null).default(null),
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

export const authModels = {
  USER_COLLECTION_NAME,
  USER_SCHEMA,
  findOneByEmail,
  createNewUser,
};
