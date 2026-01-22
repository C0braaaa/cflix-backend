import { commentServices } from "~/services/commentServices";
import { StatusCodes } from "http-status-codes";

const addComment = async (req, res) => {
  try {
    const newComment = await commentServices.addComment(req.body);
    const io = req.app.get("socketio");

    if (io) {
      io.to(req.body.movie_slug).emit("receive_comment", newComment);
    }
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Add comment successfully",
      data: newComment,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// get comment
const getCommentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const commnents = await commentServices.getCommentBySlug(slug);
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Get comment successfully",
      data: commnents,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// vote comment (like/dislike)
const toggleVoteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { type } = req.body;
    const updatedComment = await commentServices.toggleVoteComment(
      id,
      userId,
      type,
    );
    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Vote comment successfully",
      data: updatedComment,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const deletedComment = await commentServices.deleteComment(
      id,
      userId,
      userRole,
    );

    const io = req.app.get("socketio");

    if (io) {
      io.to(deletedComment.movie_slug).emit(
        "delete_comment",
        deletedComment._id,
      );
    }

    res.status(StatusCodes.OK).json({
      status: true,
      msg: "Delete comment successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};
export const commentController = {
  addComment,
  getCommentBySlug,
  toggleVoteComment,
  deleteComment,
};
