//
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/config/environment";
import axios from "axios";
import { viewsServices } from "./viewsService";

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

const getTopViewedTool = {
  name: "get_top_viewed_movies",
  description:
    "Dùng để lấy danh sách các phim có lượt xem cao nhất, top phim thịnh hành, hoặc bộ phim hot nhất trên hệ thống CFlix.",
  parameters: {
    type: "OBJECT",
    properties: {
      type: {
        type: "STRING",
        description:
          "Loại thống kê: 'day' (ngày), 'week' (tuần), 'month' (tháng). Mặc định là 'all' (tất cả thời gian).",
      },
    },
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

const callTopViewedAPI = async (type = "") => {
  try {
    // Gọi thẳng logic backend, lấy top phim
    const res = await viewsServices.getTopViewed(type);

    // Format lại data cho ngắn gọn để nhồi cho AI, tránh bị quá tải Token
    let moviesData = [];
    if (res && res.data && res.data.length > 0) {
      moviesData = res.data;
    } else if (Array.isArray(res)) {
      moviesData = res;
    }

    if (moviesData.length > 0) {
      const topMovies = moviesData.slice(0, 5).map((item) => ({
        name: item.name,
        views: item.views,
        slug: item.slug,
      }));
      return {
        movies: topMovies,
        message: "Lấy danh sách top phim thành công.",
      };
    }

    return { movies: [], message: "Hiện chưa có dữ liệu thống kê phim." };
  } catch (error) {
    return { error: "Lỗi hệ thống khi lấy top phim." };
  }
};

const chatWithAI = async (history) => {
  // 1. Khởi tạo model (Dùng gemini-pro)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ functionDeclarations: [searchMovieTool, getTopViewedTool] }],
    systemInstruction: `Bạn là ◉ϟ⊕τ, trợ lý chuyên về phim của website CFlix. 
    1. Chỉ trả lời về phim. 
    2. Nếu người dùng hỏi ngoài phạm vi, đáp: "Câu hỏi này nằm ngoài phạm vi hỗ trợ của hệ thống. Hãy hỏi câu hỏi liên quan đến phim ảnh."
    3. TUYỆT ĐỐI KHÔNG TỰ BỊA RA TÊN PHIM HAY SLUG.
    4. Khi người dùng hỏi tên phim, phải dùng công cụ 'search_kkphim' để tìm kiếm. 
    5. Khi người dùng hỏi về "phim xem nhiều nhất", "top phim", "phim hot", BẮT BUỘC dùng công cụ 'get_top_viewed_movies'.
    6. Khi đã có kết quả từ 'search_kkphim', hãy trả lời và đính kèm link theo định dạng Markdown: [Tên Phim](/phim/slug-phim).
    7. Nếu công cụ trả về không có phim, hãy báo xin lỗi và nói hệ thống chưa cập nhật phim này.
    8. Nếu người dùng hỏi bạn là ai thì trả lời bạn là ◉ϟ⊕τ, trợ lý chuyên về phim của website CFlix.
    9. Nếu người dùng chào bạn thì bạn sẽ giới thiệu bạn là ◉ϟ⊕τ, trợ lý chuyên về phim của website CFlix và hỏi người dùng muốn tìm phim gì hoặc cần gợi ý phim nào.
    10. Nếu người dùng hỏi về có phim nào hay, hoặc hiện nay có phim nào hay không thì bạn cứ lên mạng tìm và hiển thị ra cho người dùng, tầm 1 đến 5 phim thôi, 
    không cần phải theo định dạng Markdown: [Tên Phim](/phim/slug-phim). Chỉ cần trả lời bình thường nhớ không tự bịa slug `,
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

  let result = await chat.sendMessage(userMessage);
  let response = await result.response;

  const functionCalls = response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    let apiResult;

    if (call.name === "search_kkphim") {
      apiResult = await callKKPhimAPI(call.args.keyword);
    } else if (call.name === "get_top_viewed_movies") {
      apiResult = await callTopViewedAPI(call.args.type);
    }

    if (apiResult) {
      result = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
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
