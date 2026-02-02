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
      title: `${currentUser.username} đã trả lời bạn`,
      message:
        replyContent.length > 50
          ? replyContent.slice(0, 50) + "..."
          : replyContent,
      target_url: `/phim/${movieSlug}`,
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
    return await notificationModel.createNotify({
      sender_id: currentUser._id,
      receiver_id: originalComment.user_id.toString(),
      type: "reply_comment",
      title: `${currentUser.username} đã thích bình luận của bạn`,
      message: replyContent,
      target_url: `/phim/${movieSlug}`,
      image: currentUser.avatar_url,
    });
  } catch (error) {
    console.error("Error: ", error);
  }
};

const getMyNotifications = async (userId) => {
  const data = await notificationModel.getUserNotifications(userId);
  return data;
};
export const notificationServices = {
  createReplyNotify,
  createLikeNotify,
  getMyNotifications,
};
