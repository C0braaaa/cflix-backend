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

const getTopViewed = async (type) => {
  try {
    const db = await GET_DB();
    const query = type ? { type: type } : {};

    const dataPromise = db
      .collection(VIEWS_COLLECTION_NAME)
      .find(query)
      .sort({ views: -1 })
      .toArray();

    const highestPromise = db
      .collection(VIEWS_COLLECTION_NAME)
      .find(query)
      .project({
        slug: 1,
        name: 1,
        origin_name: 1,
        poster_url: 1,
        views: 1,
        _id: 0,
      })
      .sort({ views: -1 })
      .limit(1)
      .toArray();

    const totalViewPromise = db
      .collection(VIEWS_COLLECTION_NAME)
      .aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ])
      .toArray();
    const topTypePromise = db
      .collection(VIEWS_COLLECTION_NAME)
      .aggregate([
        { $match: query },
        { $group: { _id: "$type", totalViews: { $sum: "$views" } } },
        { $sort: { totalViews: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    const [data, highest, statsRes, topTypeRes] = await Promise.all([
      dataPromise,
      highestPromise,
      totalViewPromise,
      topTypePromise,
    ]);
    return {
      data,
      viewHighest: highest.length > 0 ? highest[0] : 0,
      totalView: statsRes.length > 0 ? statsRes[0].total : 0,
      topType: topTypeRes.length > 0 ? topTypeRes[0]._id : "Chưa có",
    };
  } catch (error) {
    throw error;
  }
};

export const viewsModel = {
  VIEWS_COLLECTION_SCHEMA,
  increaseView,
  getTopViewed,
};
