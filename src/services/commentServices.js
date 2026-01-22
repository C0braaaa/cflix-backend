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

// delete comment
const deleteComment = async (id, userId, userRole) => {
  const targetComment = await commentModel.getCommentById(id);

  if (!targetComment) {
    throw new Error("Comment not found");
  }

  const isOwner = targetComment.user_id.toString() === userId.toString();
  const isAdmin = userRole === "admin";
  const commentByAdmin = targetComment.user_role === "admin";

  if (isOwner || (isAdmin && !commentByAdmin)) {
    await commentModel.deleteComment(id);
    return targetComment;
  } else {
    throw new Error("Bạn không có quyền xóa bình luận này!");
  }
};
export const commentServices = {
  addComment,
  getCommentBySlug,
  toggleVoteComment,
  deleteComment,
};
