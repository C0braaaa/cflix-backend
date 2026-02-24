import { StatusCodes } from "http-status-codes";
import { chatbotService } from "~/services/chatbotService";

const chat = async (req, res) => {
  try {
    const { history } = req.body;
    const result = await chatbotService.chatWithAI(history);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const chatbotController = { chat };
