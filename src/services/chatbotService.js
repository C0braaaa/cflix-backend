//
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/config/environment";
import axios from "axios";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const searchMovieTool = {
  name: "search_kkphim",
  description:
    "Dùng để tìm kiếm phim trên hệ thống KKPhim khi người dùng hỏi về một bộ phim cụ thể hoặc cần gợi ý phim.",
  parameters: {
    type: "OBJECT",
    properties: {
      keyword: {
        type: "STRING",
        description:
          "Từ khóa tìm kiếm phim (VD: 'Người nhện', 'Hành động', 'Tình cảm')",
      },
    },
    required: ["keyword"],
  },
};

const callKKPhimAPI = async (keyword) => {
  try {
    const res = await axios.get(
      `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`,
    );
    if (res.data && res.data.data && res.data.data.items) {
      const movies = res.data.data.items.slice(0, 5).map((item) => ({
        name: item.name,
        slug: item.slug,
      }));
      return { movies };
    }
    return { movies: [], message: "Không tìm thấy phim này trên hệ thống." };
  } catch (error) {
    return { error: "Lỗi khi gọi API hệ thống KKPhim." };
  }
};

const chatWithAI = async (history) => {
  // 1. Khởi tạo model (Dùng gemini-pro)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    tools: [{ functionDeclarations: [searchMovieTool] }],
    systemInstruction: `Bạn là C-Bot, trợ lý chuyên về phim của website CFlix. 
    1. Chỉ trả lời về phim. 
    2. Nếu người dùng hỏi ngoài phạm vi, đáp: "Câu hỏi này nằm ngoài phạm vi hỗ trợ của hệ thống."
    3. TUYỆT ĐỐI KHÔNG TỰ BỊA RA TÊN PHIM HAY SLUG.
    4. Khi người dùng hỏi tên phim, phải dùng công cụ 'search_kkphim' để tìm kiếm. 
    5. Khi đã có kết quả từ 'search_kkphim', hãy trả lời và đính kèm link theo định dạng Markdown: [Tên Phim](/phim/slug-phim).
    6. Nếu công cụ trả về không có phim, hãy báo xin lỗi và nói hệ thống chưa cập nhật phim này.`,
  });

  // 2. Chuyển đổi format history từ OpenAI sang Gemini
  // Gemini yêu cầu role là 'user' và 'model'
  let cleanHistory = [...history];
  while (cleanHistory.length > 0 && cleanHistory[0].role !== "user") {
    cleanHistory.shift();
  }
  const chatHistory = cleanHistory.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Lấy tin nhắn mới nhất của người dùng
  const userMessage = chatHistory.pop().parts[0].text;

  // 3. Khởi tạo phiên chat và gửi tin nhắn
  const chat = model.startChat({
    history: chatHistory,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(userMessage);
  const response = await result.response;

  const functionCalls = response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    if (call.name === "search_kkphim") {
      const apiResult = await callKKPhimAPI(call.args.keyword);

      result = await chat.sendMessage([
        {
          functionResponse: {
            name: "search_kkphim",
            response: apiResult,
          },
        },
      ]);
      response = await result.response;
    }
  }

  return {
    role: "assistant",
    content: response.text(),
  };
};

export const chatbotService = {
  chatWithAI,
};
