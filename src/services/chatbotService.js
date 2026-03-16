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
        "Dùng khi người dùng đề cập đến MỘT TÊN PHIM CỤ THỂ trong câu hỏi, dù hỏi theo cách nào: 'tìm phim X', 'có phim X không', 'phim X hay không', 'cho xem phim X', 'X có trên đây không'... Chỉ cần có tên phim hoặc một từ khóa nào đó là dùng tool này.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Tên phim được nhắc đến trong câu hỏi.",
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
        "Dùng khi người dùng hỏi về top phim, phim hot, phim trending, phim xem nhiều nhất trên CFlix. KHÔNG dùng khi đã có tên phim cụ thể.",
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
4. TÌM TÊN PHIM: Dùng 'search_kkphim' khi người dùng đề cập tên phim CỤ THỂ hoặc hỏi kiểu:
   'có phim X không', 'tìm phim X', 'cho xem X', 'X có trên đây không', 'phim X hay không'.
   Trích xuất tên phim từ câu hỏi rồi dùng làm keyword.
   KHÔNG dùng khi câu hỏi không có tên phim cụ thể.
5. PHIM HOT / TOP VIEW: Dùng 'get_top_viewed_movies' CHỈ KHI người dùng hỏi top phim, phim xem nhiều nhất, phim hot/trending trên CFlix.
6. FORMAT KẾT QUẢ TỪ TOOL: Khi có kết quả từ Tool, PHẢI format đúng như sau:
   - Link Markdown: [Tên Phim](/phim/slug) — trong đó "Tên Phim" là tên thật của bộ phim, KHÔNG được thay bằng "xem ngay", "xem phim", hay bất kỳ chữ nào khác.
   - Ví dụ ĐÚNG: [Batman Ninja](/phim/batman-ninja)
   - Ví dụ SAI: [xem ngay](/phim/batman-ninja)

TRẢ LỜI TỰ DO (không dùng Tool):
7. Các câu hỏi chung về phim (gợi ý phim hay, phim theo thể loại,...) thì trả lời bằng kiến thức. 
   TUYỆT ĐỐI KHÔNG tự tạo link Markdown dưới bất kỳ hình thức nào. 
   Chỉ liệt kê tên phim thuần túy, không có [tên](/link).`;

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
      temperature: 0.1,
      max_tokens: 1024,
    });

    const responseMessage = response.choices[0].message;

    // Không có tool call -> trả lời thẳng
    if (!responseMessage.tool_calls) {
      console.log("📝 [NO TOOL] Response content:", responseMessage.content);
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
      // tools: tools,
      // tool_choice: "none",
      temperature: 0.1,
    });
    console.log(
      "🔧 [TOOL RESPONSE] Raw content:",
      finalResponse.choices[0].message.content,
    );
    console.log(
      "🔧 [TOOL RESPONSE] Has markdown links?",
      /\[.*?\]\(.*?\)/.test(finalResponse.choices[0].message.content),
    );

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
