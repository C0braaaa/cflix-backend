import Joi from "joi";
import { GET_DB } from "~/config/mongodb";
import { ObjectId } from "mongodb";

const SLIDER_COLLECTION_NAME = "sliders";

const SLIDER_SCHEMA = Joi.object({
  name: Joi.string().required().trim(),
  origin_name: Joi.string().required().trim(),
  slug: Joi.string().required().trim(),
  imdb: Joi.string().allow("").default("N/A"),
  quality: Joi.string().default("FHD"),
  tag_model: Joi.string().default("T16"),
  tag_classic: Joi.array().items(Joi.string()).default([]),
  types: Joi.array().items(Joi.string()).default([]),
  content: Joi.string().allow("").default(""),
  thumb_url: Joi.string().required().trim(),
  poster_url: Joi.string().required().trim(),
  to_info_page: Joi.string().required().trim(),
  to_watch_page: Joi.string().required().trim(),
  createdAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  updatedAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
});

// get all sliders
const getSliders = async () => {
  try {
    const db = await GET_DB();

    return await db
      .collection(SLIDER_COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    throw error;
  }
};

export const sliderModels = {
  SLIDER_COLLECTION_NAME,
  SLIDER_SCHEMA,
  getSliders,
};
