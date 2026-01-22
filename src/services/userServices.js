import { userModels } from "~/models/userModels";
import { StatusCodes } from "http-status-codes";
import { interactionModel } from "~/models/interactionsModel";

//update profile
const update = async (userId, regBody) => {
  try {
    const updateData = {
      username: regBody.username,
      gender: regBody.gender,
      avatar_url: regBody.avatar_url,
      role: regBody.role,
      isActive: regBody.isActive,
    };

    // loc bo nhung truong undefined
    Object.keys(updateData).forEach((key) => {
      updateData[key] === undefined && delete updateData[key];
    });

    //Goi model update
    const updatedUser = await userModels.updateUser(userId, updateData);

    if (updateData) delete updateData.password;

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

// get all users
const getAllUSers = async (filters) => {
  try {
    const users = await userModels.getAllUsers(filters);
    return users;
  } catch (error) {
    throw error;
  }
};

const getDetailUser = async (userId) => {
  try {
    const user = await userModels.findOneById(userId);

    if (!user) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "User not found",
      };
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const existUser = await userModels.findOneById(userId);

    if (!existUser) {
      throw {
        code: StatusCodes.NOT_FOUND,
        message: "User khong ton tai!",
      };
    }
    if (existUser.role === "admin") {
      throw {
        code: StatusCodes.FORBIDDEN,
        message: "Khong the xoa tai khoan admin!",
      };
    }

    const rs = await userModels.deleteUser(userId);
    return rs;
  } catch (error) {
    throw error;
  }
};
// add favorite movie
const toggleFavorite = async (userId, movieData) => {
  try {
    const uid = userId.toString();
    const type = "favorite";

    const exists = await interactionModel.findInteraction(
      uid,
      movieData.slug,
      type,
    );

    if (exists) {
      await interactionModel.removeInteraction(uid, movieData.slug, type);
      return { status: "removed", slug: movieData.slug };
    } else {
      const newItem = {
        user_id: uid,
        slug: movieData.slug,
        name: movieData.name,
        origin_name: movieData.origin_name,
        poster_url: movieData.poster_url,
        type: type,
      };
      await interactionModel.addInteraction(newItem);
      return { status: "added", newItem };
    }
  } catch (error) {
    throw error;
  }
};

const togglePlaylist = async (userId, movieData) => {
  try {
    const uid = userId.toString();
    const type = "playlist";

    const exists = await interactionModel.findInteraction(
      uid,
      movieData.slug,
      type,
    );

    if (exists) {
      await interactionModel.removeInteraction(uid, movieData.slug, type);
      return { status: "removed", slug: movieData.slug };
    } else {
      const newItem = {
        user_id: uid,
        slug: movieData.slug,
        name: movieData.name,
        origin_name: movieData.origin_name,
        poster_url: movieData.poster_url,
        type: type,
      };
      await interactionModel.addInteraction(newItem);
      return { status: "added", newItem };
    }
  } catch (error) {
    throw error;
  }
};

const saveProgress = async (userId, movieData) => {
  try {
    const progressData = {
      user_id: userId.toString(),
      slug: movieData.slug,
      name: movieData.name,
      origin_name: movieData.origin_name,
      poster_url: movieData.poster_url,
      episode_slug: movieData.episode_slug,
      episode_name: movieData.episode_name,
      current_time: movieData.current_time,
      duration: movieData.duration,

      type: "continue_watching",
    };

    const rs = await interactionModel.saveProgress(progressData);
    return rs;
  } catch (error) {
    throw error;
  }
};

const removeContinueWatching = async (userId, movileSlug) => {
  return await interactionModel.removeInteraction(
    userId,
    movileSlug,
    "continue_watching",
  );
};
// pagination for favorite, palylist and continue watching
const getInteractionsPagination = async (userId, type, page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 18;

  // Gọi Model mới
  const result = await interactionModel.getInteractions(
    userId,
    type,
    pageNum,
    limitNum,
  );

  return {
    items: result.items,
    totalItems: result.total,
    currentPage: pageNum,
    totalPages: Math.ceil(result.total / limitNum),
  };
};
const getFavorites = async (userId, query) => {
  return await getInteractionsPagination(
    userId,
    "favorite",
    query.page,
    query.limit,
  );
};

const getPlaylist = async (userId, query) => {
  return await getInteractionsPagination(
    userId,
    "playlist",
    query.page,
    query.limit,
  );
};

const getContinueWatching = async (userId, query) => {
  return await getInteractionsPagination(
    userId,
    "continue_watching",
    query.page,
    query.limit,
  );
};

const checkMovieStatus = async (userId, slug) => {
  const uid = userId.toString();
  const [favorite, playlist] = await Promise.all([
    interactionModel.findInteraction(uid, slug, "favorite"),
    interactionModel.findInteraction(uid, slug, "playlist"),
  ]);
  return {
    isFavorite: !!favorite,
    isPlaylist: !!playlist,
  };
};
const getProgress = async (userId, slug) => {
  const progress = await interactionModel.findInteraction(
    userId,
    slug,
    "continue_watching",
  );
  return progress;
};
export const userServices = {
  update,
  getAllUSers,
  getDetailUser,
  toggleFavorite,
  togglePlaylist,
  saveProgress,
  removeContinueWatching,
  deleteUser,
  getFavorites,
  getPlaylist,
  getContinueWatching,
  checkMovieStatus,
  getProgress,
};
