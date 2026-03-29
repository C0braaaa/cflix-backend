import { notificationModel } from "~/models/notificationModel";
import { commentModel } from "~/models/commentModel";

const createReplyNotify = async (
  currentUser,
  targetCommentId,
  replyContent,
  movieSlug,
) => {
  try {
    const originalComment = await commentModel.getCommentById(targetCommentId);
    if (
      !originalComment ||
      originalComment.user_id.toString() === currentUser._id.toString()
    )
      return null;
    return await notificationModel.createNotify({
      sender_id: currentUser._id,
      receiver_id: originalComment.user_id.toString(),
      type: "reply_comment",
      sender_name: currentUser.username,
      message:
        replyContent.length > 50
          ? replyContent.slice(0, 50) + "..."
          : replyContent,
      target_url: `/phim/${movieSlug}#comment-${targetCommentId}`,
      image: currentUser.avatar_url,
    });
  } catch (error) {
    console.error("Error: ", error);
  }
};

const createLikeNotify = async (currentUser, targetCommentId, movieSlug) => {
  try {
    const originalComment = await commentModel.getCommentById(targetCommentId);
    if (
      !originalComment ||
      originalComment.user_id.toString() === currentUser._id.toString()
    )
      return null;

    const messageContent = originalComment.content;
    return await notificationModel.createNotify({
      sender_id: currentUser._id,
      receiver_id: originalComment.user_id.toString(),
      type: "like_comment",
      sender_name: currentUser.username,
      message:
        messageContent.length > 50
          ? messageContent.slice(0, 50) + "..."
          : messageContent,
      target_url: `/phim/${movieSlug}#comment-${targetCommentId}`,
      image: currentUser.avatar_url,
    });
  } catch (error) {
    console.error("Error: ", error);
  }
};

const markAsRead = async (id, userId) => {
  return await notificationModel.markAsRead(id, userId);
};

const markAllAsRead = async (userId) => {
  return await notificationModel.markAllAsRead(userId);
};

const getMyNotifications = async (userId) => {
  const data = await notificationModel.getUserNotifications(userId);
  return data;
};

const deleteNotify = async (id, userId) => {
  return await notificationModel.deleteNotify(id, userId);
};
export const notificationServices = {
  createReplyNotify,
  createLikeNotify,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotify,
};
