import Groq from "groq-sdk";
import { env } from "~/config/environment";
import axios from "axios";
import { viewsServices } from "./viewsService";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const stripFakeMarkdownLinks = (text) => {
  if (!text) return text;
  return text.replace(/\[([^\]]+)\]\(\/phim\/[^)]+\)/g, "$1");
};

const tools = [
  {
    type: "function",
    function: {
      name: "search_kkphim",
      description:
        "CHỈ dùng khi người dùng hỏi TÊN CỤ THỂ của một bộ phim (VD: 'Tìm phim Avengers', 'phim Người Nhện', 'phim Inception'). KHÔNG dùng cho các câu hỏi chung chung như 'phim hay', 'gợi ý phim', 'phim nào xem được'.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Tên cụ thể của bộ phim cần tìm.",
          },
        },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_top_viewed_movies",
      description:
        "CHỈ dùng khi người dùng hỏi rõ ràng về: top phim, phim xem nhiều nhất, phim hot, phim trending, phim thịnh hành trên CFlix. KHÔNG dùng cho các câu hỏi gợi ý phim thông thường.",
      parameters: { type: "object", properties: {} },
    },
  },
];

const callKKPhimAPI = async (keyword) => {
  try {
    const res = await axios.get(
      `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`,
    );
    if (res.data?.data?.items?.length > 0)
      return {
        movies: res.data.data.items
          .slice(0, 5)
          .map((i) => ({ name: i.name, slug: i.slug })),
      };
    return { movies: [], message: "Không tìm thấy phim này." };
  } catch (error) {
    return { error: "Lỗi hệ thống KKPhim." };
  }
};

const callTopViewedAPI = async () => {
  try {
    const res = await viewsServices.getTopViewed("");
    let moviesData = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
    if (moviesData.length > 0)
      return {
        movies: moviesData.slice(0, 5).map((item) => ({
          name: item.name,
          views: item.views,
          slug: item.slug,
        })),
        message: "Lấy top phim thành công.",
      };
    return { movies: [], message: "Hiện chưa có dữ liệu thống kê phim." };
  } catch (error) {
    return { error: "Lỗi lấy top phim." };
  }
};

// Fallback: gọi lại AI không dùng tool khi có lỗi tool_use_failed
const chatWithoutTools = async (messages) => {
  const fallbackMessages = messages.filter((m) => m.role !== "tool");
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: fallbackMessages,
    temperature: 0.7,
    max_tokens: 1024,
  });
  return stripFakeMarkdownLinks(response.choices[0].message.content);
};

const chatWithAI = async (history) => {
  const systemInstruction = `Bạn là Jarvis, trợ lý AI thông minh của website xem phim CFlix.

NGUYÊN TẮC HOẠT ĐỘNG:
1. PHẠM VI TRẢ LỜI: Bạn chỉ tư vấn về lĩnh vực phim ảnh và giải trí. Bao gồm: thông tin phim, diễn viên, đạo diễn, thể loại, cốt truyện, đánh giá phim, lịch sử điện ảnh, gợi ý phim,...
2. CÂU HỎI NGOÀI PHẠM VI: Nếu người dùng hỏi những chủ đề không liên quan đến phim ảnh (thời tiết, toán học, lập trình, tin tức,...), hãy lịch sự từ chối: "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến phim ảnh và giải trí. Bạn có muốn tôi gợi ý một bộ phim hay không? 🎬"
3. NỘI DUNG THÔ TỤC: Tuyệt đối không trả lời các câu hỏi thô tục, khiếm nhã hoặc không phù hợp.

SỬ DỤNG CÔNG CỤ:
4. TÌM TÊN PHIM: Dùng 'search_kkphim' CHỈ KHI người dùng hỏi TÊN CỤ THỂ của một bộ phim.
5. PHIM HOT / TOP VIEW: Dùng 'get_top_viewed_movies' CHỈ KHI người dùng hỏi top phim, phim xem nhiều nhất, phim hot/trending trên CFlix.
6. FORMAT KẾT QUẢ TỪ TOOL: Mọi danh sách phim lấy từ Tool đều PHẢI trả về kèm link Markdown: [Tên Phim](/phim/slug-phim).

TRẢ LỜI TỰ DO (không dùng Tool):
7. Các câu hỏi chung về phim (gợi ý phim hay, phim theo thể loại, theo quốc gia, thông tin diễn viên,...) thì trả lời bằng kiến thức của bạn. KHÔNG tự tạo link Markdown, chỉ liệt kê tên phim thôi.
8. Luôn nhiệt tình, thân thiện và xưng là Jarvis của CFlix.`;

  const cleanHistory = history.map((msg) => {
    const isBot =
      msg.role === "model" || msg.role === "C-Bot" || msg.role === "assistant";
    return { role: isBot ? "assistant" : "user", content: msg.content || "" };
  });

  let messages = [
    { role: "system", content: systemInstruction },
    ...cleanHistory,
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseMessage = response.choices[0].message;

    // Không có tool call -> trả lời thẳng
    if (!responseMessage.tool_calls) {
      return { role: "assistant", content: responseMessage.content };
    }

    // Có tool call -> xử lý từng tool
    messages.push(responseMessage);

    for (const toolCall of responseMessage.tool_calls) {
      let apiResult;
      const functionName = toolCall.function.name;

      let args;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error(
          `[Groq AI] Lỗi parse arguments:`,
          toolCall.function.arguments,
        );
        args = {};
      }

      console.log(`[Groq AI] Gọi Tool: ${functionName}`, args);

      if (functionName === "search_kkphim") {
        apiResult = await callKKPhimAPI(args.keyword);
      } else if (functionName === "get_top_viewed_movies") {
        apiResult = await callTopViewedAPI();
      } else {
        apiResult = { error: `Tool không tồn tại: ${functionName}` };
      }

      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: JSON.stringify(apiResult),
      });
    }

    const finalResponse = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: messages,
      tools: tools,
      tool_choice: "none",
      temperature: 0.7,
    });

    return {
      role: "assistant",
      content: finalResponse.choices[0].message.content,
    };
  } catch (error) {
    // Nếu lỗi tool_use_failed -> fallback trả lời không dùng tool
    if (
      error?.error?.error?.code === "tool_use_failed" ||
      error?.status === 400
    ) {
      console.warn("[Groq AI] tool_use_failed, fallback không dùng tool...");
      try {
        const fallbackContent = await chatWithoutTools(messages);
        return { role: "assistant", content: fallbackContent };
      } catch (fallbackError) {
        console.error("Lỗi fallback Chatbot:", fallbackError);
      }
    }

    console.error("Lỗi Chatbot:", error);
    return {
      role: "assistant",
      content: "Hệ thống đang bận, vui lòng thử lại sau!",
    };
  }
};

export const chatbotService = { chatWithAI };
