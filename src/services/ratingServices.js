import { ratingModel } from "~/models/ratingModel";

const toggleLike = async (slug, userId, name, poster_url) => {
  const uid = userId.toString();
  const currentRating = await ratingModel.findBySlug(slug);

  const isLiked = currentRating?.likes?.includes(uid);
  if (isLiked) {
    await ratingModel.updateLikes(slug, uid, "remove", name, poster_url);
    return { status: "removed", msg: "Đã bỏ thích!" };
  } else {
    await ratingModel.updateLikes(slug, uid, "add", name, poster_url);
    return { status: "liked", msg: "Đã thích!" };
  }
};

const toggleDislike = async (slug, userId, name, poster_url) => {
  const uid = userId.toString();
  const currentRating = await ratingModel.findBySlug(slug);

  const isLiked = currentRating?.dislikes?.includes(uid);
  if (isLiked) {
    await ratingModel.updateDislikes(slug, uid, "remove", name, poster_url);
    return { status: "removed", msg: "Đã bỏ không thích!" };
  } else {
    await ratingModel.updateDislikes(slug, uid, "add", name, poster_url);
    return { status: "disliked", msg: "Không thích!" };
  }
};

const getRating = async (slug, userId) => {
  const rating = await ratingModel.findBySlug(slug);

  if (!rating) {
    return { totalLikes: 0, totalDislikes: 0, userStatus: "neutral" };
  }
  let userStatus = "neutral";
  if (userId) {
    const uid = userId.toString();
    if (rating?.likes?.includes(uid)) userStatus = "liked";
    if (rating?.dislikes?.includes(uid)) userStatus = "disliked";
  }
  return {
    totalLikes: rating.likes?.length || 0,
    totalDislikes: rating.dislikes?.length || 0,
    userStatus: userStatus,
  };
};

const getTopLiked = async () => {
  return await ratingModel.getTopLiked();
};

export const ratingServices = {
  toggleLike,
  toggleDislike,
  getRating,
  getTopLiked,
};
