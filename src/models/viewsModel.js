import Joi from "joi";
import { GET_DB } from "~/config/mongodb";

const VIEWS_COLLECTION_NAME = "views";

const VIEWS_COLLECTION_SCHEMA = Joi.object({
  slug: Joi.string().required(),
  views: Joi.number().default(0),
  type: Joi.string().required(),
  name: Joi.string().required(),
  origin_name: Joi.string().allow(null, ""),
  poster_url: Joi.string().required(),
  updated_at: Joi.date().timestamp("javascript").default(new Date()),
});

const increaseView = async (data) => {
  try {
    const db = await GET_DB();
    const res = await db.collection(VIEWS_COLLECTION_NAME).findOneAndUpdate(
      { slug: data.slug },
      {
        $inc: { views: 1 },
        $set: {
          updated_at: new Date(),
          type: data.type,
          name: data.name,
          origin_name: data.origin_name,
          poster_url: data.poster_url,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    return res;
  } catch (error) {
    throw error;
  }
};

const getTopViewed = async (limit = 10, type = null) => {
  try {
    const db = await GET_DB();
    const query = type ? { type: type } : {};
    const res = await db
      .collection(VIEWS_COLLECTION_NAME)
      .find(query)
      .sort({ views: -1 })
      .limit(limit)
      .toArray();
    return res;
  } catch (error) {
    throw error;
  }
};

export const viewsModel = {
  VIEWS_COLLECTION_SCHEMA,
  increaseView,
  getTopViewed,
};
