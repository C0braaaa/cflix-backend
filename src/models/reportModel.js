import Joi from "joi";
import { GET_DB } from "~/config/mongodb";
import { ObjectId } from "mongodb";

const REPORT_COLLECTION_NAME = "reports";

const REPORT_SCHEMA = Joi.object({
  reporter_id: Joi.string().required().trim().strict(),
  reporter_name: Joi.string().required().trim().strict(),
  type: Joi.string().valid("movie", "comment").required(),
  movie_slug: Joi.string().required().trim().strict(),
  reason: Joi.array().items(Joi.string()).min(1).required(),
  details: Joi.string().allow("").default(""),
  comment_id: Joi.string().allow(null).default(null),
  username: Joi.string().allow(null).default(null),
  episode: Joi.string().allow(null).default(null),
  status: Joi.string()
    .valid("pending", "processing", "resolved")
    .default("pending"),
  createdAt: Joi.date()
    .timestamp("javascript")
    .default(() => new Date()),
  updatedAt: Joi.date()
    .timestamp("javascript")
    .allow(null)
    .default(() => new Date()),
});

const createReport = async (data) => {
  try {
    const valiData = await REPORT_SCHEMA.validateAsync(data, {
      abortEarly: false,
    });

    const insertData = {
      ...valiData,
      reporter_id: new ObjectId(valiData.reporter_id),
      comment_id: valiData.comment_id
        ? new ObjectId(valiData.comment_id)
        : null,
    };

    const db = await GET_DB();
    const result = await db
      .collection(REPORT_COLLECTION_NAME)
      .insertOne(insertData);

    return await db
      .collection(REPORT_COLLECTION_NAME)
      .findOne({ _id: result.insertedId });
  } catch (error) {
    throw error;
  }
};

const getAllReports = async ({ type, status, page = 1, limit = 10 }) => {
  try {
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const db = await GET_DB();
    const skip = (page - 1) * limit;

    const [reports, totalFilters] = await Promise.all([
      db
        .collection(REPORT_COLLECTION_NAME)
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection(REPORT_COLLECTION_NAME).countDocuments(query),
    ]);

    return { reports, totalFilters };
  } catch (error) {
    throw error;
  }
};

const getReportStats = async () => {
  try {
    const db = GET_DB();

    const [totalReport, pendingReport, movieReport, commentReport] =
      await Promise.all([
        db.collection(REPORT_COLLECTION_NAME).countDocuments({}),
        db
          .collection(REPORT_COLLECTION_NAME)
          .countDocuments({ status: "pending" }),
        db.collection(REPORT_COLLECTION_NAME).countDocuments({ type: "movie" }),
        db
          .collection(REPORT_COLLECTION_NAME)
          .countDocuments({ type: "comment" }),
      ]);

    return { totalReport, pendingReport, movieReport, commentReport };
  } catch (error) {
    throw error;
  }
};

export const reportModel = {
  REPORT_COLLECTION_NAME,
  REPORT_SCHEMA,
  createReport,
  getAllReports,
  getReportStats,
};
