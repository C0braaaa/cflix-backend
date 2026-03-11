import Joi from "joi";
import { GET_DB } from "~/config/mongodb";
import { ObjectId } from "mongodb";

const NOTIFICATION_COLLECTION_NAME = "notifications";

const NOTIFICATION_SCHEMA = Joi.object({
  sender_id: Joi.string().required(),
  receiver_id: Joi.string().required(),
  type: Joi.string()
    .valid("new_episode", "reply_comment", "like_comment")
    .required(),
  sender_name: Joi.string().required(),
  message: Joi.string().required(),
  target_url: Joi.string().required(),
  image: Joi.string().optional().allow(""),
  is_read: Joi.boolean().default(false),
  created_at: Joi.date().timestamp("javascript").default(new Date()),
});

const createNotify = async (data) => {
  try {
    const validData = await NOTIFICATION_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });
    const insertData = {
      ...validData,
      sender_id: new ObjectId(validData.sender_id),
      receiver_id: new ObjectId(validData.receiver_id),
      created_at: new Date(),
    };
    const db = await GET_DB();
    const result = await db
      .collection(NOTIFICATION_COLLECTION_NAME)
      .insertOne(insertData);
    return await db
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOne({ _id: result.insertedId });
  } catch (error) {
    throw error;
  }
};

const getUserNotifications = async (user_id, limit = 10) => {
  try {
    const db = await GET_DB();
    const notification = await db
      .collection(NOTIFICATION_COLLECTION_NAME)
      .aggregate([
        { $match: { receiver_id: new ObjectId(user_id) } },
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ])
      .toArray();
    const unreadCount = await db
      .collection(NOTIFICATION_COLLECTION_NAME)
      .countDocuments({
        receiver_id: new ObjectId(user_id),
        is_read: false,
      });
    return { notification, unreadCount };
  } catch (error) {
    throw error;
  }
};

const markAsRead = async (id, userId) => {
  try {
    const db = await GET_DB();
    return await db
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id), receiver_id: new ObjectId(userId) },
        { $set: { is_read: true } },
        { returnDocument: "after" },
      );
  } catch (error) {
    throw error;
  }
};
const markAllAsRead = async (userId) => {
  try {
    const db = GET_DB();
    return await db
      .collection(NOTIFICATION_COLLECTION_NAME)
      .updateMany(
        { receiver_id: new ObjectId(userId), is_read: false },
        { $set: { is_read: true } },
      );
  } catch (error) {
    throw error;
  }
};

const deleteNotify = async (id, userId) => {
  try {
    const db = await GET_DB();
    const result = await db.collection(NOTIFICATION_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(id),
      receiver_id: new ObjectId(userId),
    });
    return result;
  } catch (error) {
    throw error;
  }
};
export const notificationModel = {
  createNotify,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotify,
};
