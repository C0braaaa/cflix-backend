import { commentModel } from "~/models/commentModel";

const addComment = async (data) => {
  return await commentModel.addComment(data);
};

const getCommentBySlug = async (slug) => {
  return await commentModel.getCommentBySlug(slug);
};

const toggleVoteComment = async (commentId, userId, type) => {
  if (!["like", "dislike"].includes(type)) {
    throw new Error("Invalid vote type");
  }
  return await commentModel.toggleVoteComment(commentId, userId, type);
};
export const commentServices = {
  addComment,
  getCommentBySlug,
  toggleVoteComment,
};
