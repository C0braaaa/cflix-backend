// server/src/models/interactionModel.js
import Joi from "joi";
import { GET_DB } from "~/config/mongodb";

const INTERACTION_COLLECTION_NAME = "interactions";

const INTERACTION_SCHEMA = Joi.object({
  user_id: Joi.string().required(),
  slug: Joi.string().required(),
  name: Joi.string().required(),
  origin_name: Joi.string().allow("").default(""),
  poster_url: Joi.string().allow("").default(""),
  type: Joi.string()
    .valid("favorite", "playlist", "continue_watching")
    .required(),
  episode_slug: Joi.string().default(""),
  episode_name: Joi.string().default(""),
  current_time: Joi.number().default(0),
  duration: Joi.number().default(0),
  updated_at: Joi.date().timestamp("javascript").default(new Date()),
  created_at: Joi.date().timestamp("javascript").default(new Date()),
});

const createCollection = async () => {
  const db = await GET_DB();
  await db
    .collection(INTERACTION_COLLECTION_NAME)
    .createIndex({ user_id: 1, type: 1, updatedAt: -1 });
  await db
    .collection(INTERACTION_COLLECTION_NAME)
    .createIndex({ user_id: 1, slug: 1, type: 1 }, { unique: true });
};

const addInteraction = async (data) => {
  const db = await GET_DB();
  const validData = await INTERACTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
  return await db.collection(INTERACTION_COLLECTION_NAME).insertOne(validData);
};

// 2. Xóa
const removeInteraction = async (userId, slug, type) => {
  const db = await GET_DB();
  return await db
    .collection(INTERACTION_COLLECTION_NAME)
    .deleteOne({ user_id: userId, slug: slug, type: type });
};

// 3. Tìm kiếm (Check tồn tại)
const findInteraction = async (userId, slug, type) => {
  const db = await GET_DB();
  return await db
    .collection(INTERACTION_COLLECTION_NAME)
    .findOne({ user_id: userId, slug: slug, type: type });
};

// 4. Lưu tiến độ (Dùng riêng cho Continue Watching - Upsert)
const saveProgress = async (data) => {
  const db = await GET_DB();
  // Data cần có: user_id, slug, type='continue_watching'
  return await db.collection(INTERACTION_COLLECTION_NAME).updateOne(
    { user_id: data.user_id, slug: data.slug, type: "continue_watching" },
    {
      $set: { ...data, updatedAt: Date.now() },
      $setOnInsert: { createdAt: Date.now() },
    },
    { upsert: true },
  );
};

// 5. Lấy danh sách (Phân trang chung cho tất cả)
const getInteractions = async (userId, type, page, limit) => {
  const db = await GET_DB();
  const skip = (page - 1) * limit;
  const query = { user_id: userId, type: type };

  const total = await db
    .collection(INTERACTION_COLLECTION_NAME)
    .countDocuments(query);
  const items = await db
    .collection(INTERACTION_COLLECTION_NAME)
    .find(query)
    .sort({ updatedAt: -1 }) // Mới nhất lên đầu
    .skip(skip)
    .limit(limit)
    .toArray();
  return { items, total };
};

export const interactionModel = {
  INTERACTION_COLLECTION_NAME,
  createCollection,
  addInteraction,
  removeInteraction,
  findInteraction,
  saveProgress,
  getInteractions,
};
