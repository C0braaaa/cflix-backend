import Groq from "groq-sdk";
import { env } from "~/config/environment";
import axios from "axios";
import { viewsServices } from "./viewsService";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const tools = [
  {
    type: "function",
    function: {
      name: "search_kkphim",
      description:
        "DÙNG KHI người dùng hỏi đích danh TÊN 1 bộ phim cụ thể (VD: 'Tìm phim Người Nhện').",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Tên chính xác của bộ phim.",
          },
        },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_movies_by_genre",
      description:
        "DÙNG KHI người dùng muốn tìm phim theo THỂ LOẠI (VD: phim hành động, phim ma, phim hài...).",
      parameters: {
        type: "object",
        properties: {
          genre_slug: {
            type: "string",
            enum: [
              "hanh-dong",
              "mien-tay",
              "tre-em",
              "lich-su",
              "co-trang",
              "chien-tranh",
              "vien-tuong",
              "kinh-di",
              "tai-lieu",
              "bi-an",
              "tinh-cam",
              "tam-ly",
              "the-thao",
              "phieu-luu",
              "am-nhac",
              "gia-dinh",
              "hoc-duong",
              "hai-huoc",
              "hinh-su",
              "vo-thuat",
              "khoa-hoc",
              "than-thoai",
              "chinh-kich",
              "kinh-dien",
            ],
          },
        },
        required: ["genre_slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_movies_by_country",
      description:
        "DÙNG KHI người dùng muốn tìm phim theo QUỐC GIA (có hoặc không có NĂM).",
      parameters: {
        type: "object",
        properties: {
          country_slug: {
            type: "string",
            enum: [
              "viet-nam",
              "trung-quoc",
              "thai-lan",
              "hong-kong",
              "phap",
              "duc",
              "ha-lan",
              "mexico",
              "thuy-dien",
              "philippines",
              "dan-mach",
              "thuy-si",
              "ukraina",
              "han-quoc",
              "au-my",
              "an-do",
              "canada",
              "tay-ban-nha",
              "indonesia",
              "ba-lan",
              "malaysia",
              "bo-dao-nha",
              "uae",
              "chau-phi",
              "a-rap-xe-ut",
              "nhat-ban",
              "dai-loan",
              "anh",
              "tho-nhi-ky",
              "nga",
              "uc",
              "brazil",
              "y",
              "na-uy",
              "nam-phi",
            ],
            description:
              "Slug của quốc gia tương ứng. VD: 'Hàn Quốc' -> 'han-quoc'.",
          },
          year: {
            type: "string",
            description:
              "Năm phát hành (VD: '2023'). Nếu người dùng KHÔNG nhắc đến năm, BẮT BUỘC truyền vào chuỗi rỗng ''.",
          },
        },
        required: ["country_slug", "year"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_top_viewed_movies",
      description:
        "BẮT BUỘC DÙNG khi người dùng hỏi: phim xem nhiều nhất, top phim, phim thịnh hành, phim hot.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// --- CÁC HÀM XỬ LÝ API ---
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

const callKKPhimGenreAPI = async (genre_slug) => {
  try {
    const res = await axios.get(
      `https://phimapi.com/v1/api/the-loai/${genre_slug}?limit=5`,
    );
    if (res.data?.data?.items?.length > 0)
      return {
        movies: res.data.data.items
          .slice(0, 5)
          .map((i) => ({ name: i.name, slug: i.slug })),
        message: `Đã tìm thấy phim cho thể loại: ${genre_slug}`,
      };
    return { movies: [], message: "Hiện chưa có phim cho thể loại này." };
  } catch (error) {
    return { error: "Lỗi hệ thống KKPhim." };
  }
};

const callKKPhimCountryAPI = async (country_slug, year) => {
  try {
    let url = `https://phimapi.com/v1/api/quoc-gia/${country_slug}?limit=5`;

    if (year && year.trim() !== "") {
      url += `&year=${year}`;
    }

    const res = await axios.get(url);
    if (res.data?.data?.items?.length > 0) {
      return {
        movies: res.data.data.items
          .slice(0, 5)
          .map((i) => ({ name: i.name, slug: i.slug })),
        message: `Đã tìm thấy phim quốc gia: ${country_slug}${year && year.trim() !== "" ? ` năm ${year}` : ""}`,
      };
    }
    return {
      movies: [],
      message: `Hiện chưa có phim quốc gia này${year && year.trim() !== "" ? ` trong năm ${year}` : ""}.`,
    };
  } catch (error) {
    return { error: "Lỗi hệ thống KKPhim khi tìm quốc gia." };
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

// --- LOGIC CHAT ---
const chatWithAI = async (history) => {
  try {
    const systemInstruction = `Bạn là Jarvis, trợ lý AI ảo cực kỳ thông minh của website CFlix.

TUYỆT ĐỐI TUÂN THỦ CÁC LUẬT SAU:
1. GIAO TIẾP: Luôn lịch sự, tự xưng là Jarvis của CFlix. Từ chối trả lời các câu hỏi không liên quan đến phim ảnh (thời tiết, toán học, v.v.).
2. TÌM TÊN PHIM: Dùng 'search_kkphim' khi khách hỏi TÊN 1 bộ phim.
3. TÌM THEO THỂ LOẠI: Khách hỏi phim theo thể loại (VD: kinh dị, hài, hành động) -> BẮT BUỘC dùng 'get_movies_by_genre'.
4. TÌM THEO QUỐC GIA (VÀ NĂM): Khách hỏi phim theo quốc gia (VD: phim Hàn Quốc, phim Thái Lan, phim Âu Mỹ năm 2023) -> BẮT BUỘC dùng 'get_movies_by_country'. Nếu khách có nói năm, hãy nhớ truyền năm vào.
5. PHIM HOT: Khách hỏi phim hot, top view -> Dùng 'get_top_viewed_movies'.
6. FORMAT KẾT QUẢ: Mọi danh sách phim lấy từ Tool đều PHẢI trả về định dạng đính kèm link Markdown: [Tên Phim](/phim/slug-phim).
7. TỰ CHÉM GIÓ: Chỉ khi khách hỏi những chủ đề rất mơ hồ không thuộc công cụ (VD: "phim về robot ngoài hành tinh"), bạn được phép tự gợi ý 3 phim bằng kiến thức của bạn. CHỈ IN TÊN PHIM, KHÔNG TỰ TẠO LINK MARKDOWN.
8. KHÔNG BAO GIWOF TRẢ LỜI NHỮNG CÂU HỎI KHÔNG LIÊN QUAN ĐẾN PHIM ẢNH. LUÔN TỪ CHỐI LỊCH SỰ VỚI NHỮNG CÂU HỎI NGOÀI LĨNH VỰC PHIM ẢNH.
9. Nếu người dùng hỏi gì về phim ảnh cứ trả lời thoải mái. Tuy nhiên nếu kết quả không lấy từ Tool thì không được trả lời dưới dạng link Markdown: [Tên Phim](/phim/slug-phim), mà liệt kê ra tầm 5 phim thôi! `;

    const cleanHistory = history.map((msg) => {
      const isBot =
        msg.role === "model" ||
        msg.role === "C-Bot" ||
        msg.role === "assistant";
      return { role: isBot ? "assistant" : "user", content: msg.content || "" };
    });

    let messages = [
      { role: "system", content: systemInstruction },
      ...cleanHistory,
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        let apiResult;
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`[Groq AI] Gọi Tool: ${functionName}`, args);

        if (functionName === "search_kkphim") {
          apiResult = await callKKPhimAPI(args.keyword);
        } else if (functionName === "get_movies_by_genre") {
          apiResult = await callKKPhimGenreAPI(args.genre_slug);
        } else if (functionName === "get_movies_by_country") {
          // Bắt thêm Tool mới: truyền cả Quốc gia và Năm (nếu có)
          apiResult = await callKKPhimCountryAPI(args.country_slug, args.year);
        } else if (functionName === "get_top_viewed_movies") {
          apiResult = await callTopViewedAPI();
        }

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(apiResult),
        });
      }

      const finalResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
      });
      return {
        role: "assistant",
        content: finalResponse.choices[0].message.content,
      };
    }

    return { role: "assistant", content: responseMessage.content };
  } catch (error) {
    console.error("Lỗi Chatbot:", error);
    return {
      role: "assistant",
      content: "Hệ thống đang bận, vui lòng thử lại sau!",
    };
  }
};

export const chatbotService = { chatWithAI };
