import Groq from "groq-sdk";
import { env } from "~/config/environment";
import axios from "axios";
import { viewsServices } from "./viewsService";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const stripFakeMarkdownLinks = (text) => {
  if (!text) return text;
  return text.replace(/\[([^\]]+)\]\(\/phim\/[^)]+\)/g, "$1");
};

// ===================== GENRE MAP =====================
const GENRE_SLUG_MAP = {
  "hành động": "hanh-dong",
  "cổ trang": "co-trang",
  "tài liệu": "tai-lieu",
  "thể thao": "the-thao",
  "học đường": "hoc-duong",
  "khoa học": "khoa-hoc",
  "miền tây": "mien-tay",
  "chiến tranh": "chien-tranh",
  "bí ẩn": "bi-an",
  "phiêu lưu": "phieu-luu",
  "hài hước": "hai-huoc",
  "thần thoại": "than-thoai",
  "trẻ em": "tre-em",
  "viễn tưởng": "vien-tuong",
  "tình cảm": "tinh-cam",
  "âm nhạc": "am-nhac",
  "hình sự": "hinh-su",
  "chính kịch": "chinh-kich",
  "lịch sử": "lich-su",
  "kinh dị": "kinh-di",
  "tâm lý": "tam-ly",
  "gia đình": "gia-dinh",
  "võ thuật": "vo-thuat",
  "kinh điển": "kinh-dien",
  // Alias không dấu
  "hanh dong": "hanh-dong",
  "co trang": "co-trang",
  "tai lieu": "tai-lieu",
  "the thao": "the-thao",
  "hoc duong": "hoc-duong",
  "khoa hoc": "khoa-hoc",
  "mien tay": "mien-tay",
  "chien tranh": "chien-tranh",
  "bi an": "bi-an",
  "phieu luu": "phieu-luu",
  "hai huoc": "hai-huoc",
  "than thoai": "than-thoai",
  "tre em": "tre-em",
  "vien tuong": "vien-tuong",
  "tinh cam": "tinh-cam",
  "am nhac": "am-nhac",
  "hinh su": "hinh-su",
  "chinh kich": "chinh-kich",
  "lich su": "lich-su",
  "kinh di": "kinh-di",
  "tam ly": "tam-ly",
  "gia dinh": "gia-dinh",
  "vo thuat": "vo-thuat",
  "kinh dien": "kinh-dien",
  // Alias tiếng Anh
  action: "hanh-dong",
  romance: "tinh-cam",
  horror: "kinh-di",
  comedy: "hai-huoc",
  thriller: "tam-ly",
  fantasy: "vien-tuong",
  animation: "tre-em",
  documentary: "tai-lieu",
  "martial arts": "vo-thuat",
  crime: "hinh-su",
  drama: "chinh-kich",
  war: "chien-tranh",
  history: "lich-su",
  adventure: "phieu-luu",
  music: "am-nhac",
  family: "gia-dinh",
  sport: "the-thao",
  sports: "the-thao",
  mystery: "bi-an",
  "sci-fi": "khoa-hoc",
  "science fiction": "khoa-hoc",
  mythology: "than-thoai",
  classic: "kinh-dien",
};

const resolveGenreSlug = (genreName) => {
  if (!genreName) return null;
  const normalized = genreName.trim().toLowerCase();
  if (GENRE_SLUG_MAP[normalized]) return GENRE_SLUG_MAP[normalized];
  for (const [key, slug] of Object.entries(GENRE_SLUG_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) return slug;
  }
  return null;
};

// ===================== COUNTRY MAP =====================
const COUNTRY_SLUG_MAP = {
  "việt nam": "viet-nam",
  "trung quốc": "trung-quoc",
  "thái lan": "thai-lan",
  "hồng kông": "hong-kong",
  pháp: "phap",
  đức: "duc",
  "hà lan": "ha-lan",
  mexico: "mexico",
  "thụy điển": "thuy-dien",
  philippines: "philippines",
  "đan mạch": "dan-mach",
  "thụy sĩ": "thuy-si",
  ukraina: "ukraina",
  "hàn quốc": "han-quoc",
  "âu mỹ": "au-my",
  "ấn độ": "an-do",
  canada: "canada",
  "tây ban nha": "tay-ban-nha",
  indonesia: "indonesia",
  "ba lan": "ba-lan",
  malaysia: "malaysia",
  "bồ đào nha": "bo-dao-nha",
  uae: "uae",
  "châu phi": "chau-phi",
  "ả rập xê út": "a-rap-xe-ut",
  "nhật bản": "nhat-ban",
  "đài loan": "dai-loan",
  anh: "anh",
  "thổ nhĩ kỳ": "tho-nhi-ky",
  nga: "nga",
  úc: "uc",
  brazil: "brazil",
  ý: "y",
  "na uy": "na-uy",
  "nam phi": "nam-phi",
  // Alias không dấu
  "viet nam": "viet-nam",
  "trung quoc": "trung-quoc",
  "thai lan": "thai-lan",
  "hong kong": "hong-kong",
  phap: "phap",
  duc: "duc",
  "ha lan": "ha-lan",
  "thuy dien": "thuy-dien",
  "dan mach": "dan-mach",
  "thuy si": "thuy-si",
  "han quoc": "han-quoc",
  "au my": "au-my",
  "an do": "an-do",
  "tay ban nha": "tay-ban-nha",
  "bo dao nha": "bo-dao-nha",
  "chau phi": "chau-phi",
  "a rap xe ut": "a-rap-xe-ut",
  "nhat ban": "nhat-ban",
  "dai loan": "dai-loan",
  "tho nhi ky": "tho-nhi-ky",
  "nam phi": "nam-phi",
};

const resolveCountrySlug = (countryName) => {
  if (!countryName) return null;
  const normalized = countryName.trim().toLowerCase();
  if (COUNTRY_SLUG_MAP[normalized]) return COUNTRY_SLUG_MAP[normalized];
  for (const [key, slug] of Object.entries(COUNTRY_SLUG_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) return slug;
  }
  return null;
};

// ===================== TOOLS =====================
const tools = [
  {
    type: "function",
    function: {
      name: "search_kkphim",
      description:
        "Dùng khi người dùng đề cập đến MỘT TÊN PHIM CỤ THỂ trong câu hỏi, dù hỏi theo cách nào: 'tìm phim X', 'có phim X không', 'phim X hay không', 'cho xem phim X', 'X có trên đây không'... KHÔNG dùng khi người dùng chỉ hỏi về thể loại hoặc quốc gia.",
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
        "Dùng khi người dùng hỏi về top phim, phim hot, phim trending, phim xem nhiều nhất trên CFlix. KHÔNG dùng khi đã có tên phim cụ thể, thể loại hay quốc gia.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_movies_by_genre",
      description:
        "Dùng khi người dùng muốn xem phim theo một THỂ LOẠI CỤ THỂ trên CFlix. Ví dụ: 'gợi ý phim hành động', 'cho xem phim kinh dị', 'phim tình cảm hay', 'có phim hài hước không', 'muốn xem phim cổ trang'... Các thể loại có trên CFlix: Hành Động, Cổ Trang, Tài Liệu, Thể Thao, Học Đường, Khoa Học, Miền Tây, Chiến Tranh, Bí Ẩn, Phiêu Lưu, Hài Hước, Thần Thoại, Trẻ Em, Viễn Tưởng, Tình Cảm, Âm Nhạc, Hình Sự, Chính Kịch, Lịch Sử, Kinh Dị, Tâm Lý, Gia Đình, Võ Thuật, Kinh Điển.",
      parameters: {
        type: "object",
        properties: {
          genre: {
            type: "string",
            description:
              "Tên thể loại phim. Ví dụ: 'hành động', 'kinh dị', 'tình cảm'...",
          },
          sort_field: {
            type: "string",
            enum: ["modified.time", "_id", "year"],
            description:
              "Sắp xếp theo: 'modified.time' (mới cập nhật), 'year' (năm phát hành). Mặc định: 'modified.time'.",
          },
          sort_type: {
            type: "string",
            enum: ["desc", "asc"],
            description:
              "Chiều sắp xếp: 'desc' (mới nhất trước), 'asc' (cũ nhất trước). Mặc định: 'desc'.",
          },
        },
        required: ["genre"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_movies_by_country",
      description:
        "Dùng khi người dùng muốn xem phim của một QUỐC GIA CỤ THỂ trên CFlix. Ví dụ: 'phim Hàn Quốc hay', 'gợi ý phim Nhật Bản', 'cho xem phim Trung Quốc', 'phim Mỹ mới nhất', 'phim Việt Nam', 'phim Thái Lan'... Các quốc gia có trên CFlix: Việt Nam, Trung Quốc, Thái Lan, Hồng Kông, Pháp, Đức, Hà Lan, Mexico, Thụy Điển, Philippines, Đan Mạch, Thụy Sĩ, Ukraina, Hàn Quốc, Âu Mỹ, Ấn Độ, Canada, Tây Ban Nha, Indonesia, Ba Lan, Malaysia, Bồ Đào Nha, UAE, Châu Phi, Ả Rập Xê Út, Nhật Bản, Đài Loan, Anh, Thổ Nhĩ Kỳ, Nga, Úc, Brazil, Ý, Na Uy, Nam Phi.",
      parameters: {
        type: "object",
        properties: {
          country: {
            type: "string",
            description:
              "Tên quốc gia. Ví dụ: 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Việt Nam', 'Mỹ'...",
          },
          sort_field: {
            type: "string",
            enum: ["modified.time", "_id", "year"],
            description:
              "Sắp xếp theo: 'modified.time' (mới cập nhật), 'year' (năm phát hành). Mặc định: 'modified.time'.",
          },
          sort_type: {
            type: "string",
            enum: ["desc", "asc"],
            description:
              "Chiều sắp xếp: 'desc' (mới nhất trước), 'asc' (cũ nhất trước). Mặc định: 'desc'.",
          },
        },
        required: ["country"],
      },
    },
  },
];

// ===================== API CALLERS =====================
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

const callMoviesByGenreAPI = async (
  genre,
  sortField = "modified.time",
  sortType = "desc",
) => {
  try {
    const slug = resolveGenreSlug(genre);
    if (!slug) {
      return {
        movies: [],
        message: `Thể loại "${genre}" không có trên CFlix. Các thể loại hiện có: Hành Động, Cổ Trang, Tài Liệu, Thể Thao, Học Đường, Khoa Học, Miền Tây, Chiến Tranh, Bí Ẩn, Phiêu Lưu, Hài Hước, Thần Thoại, Trẻ Em, Viễn Tưởng, Tình Cảm, Âm Nhạc, Hình Sự, Chính Kịch, Lịch Sử, Kinh Dị, Tâm Lý, Gia Đình, Võ Thuật, Kinh Điển.`,
      };
    }
    const url = `https://phimapi.com/v1/api/the-loai/${slug}?page=1&sort_field=${encodeURIComponent(sortField)}&sort_type=${sortType}&limit=5`;
    console.log(`[Genre API] Gọi: ${url}`);
    const res = await axios.get(url);
    const items = res.data?.data?.items;
    if (items?.length > 0) {
      return {
        genre_name: genre,
        movies: items.map((i) => ({
          name: i.name,
          slug: i.slug,
          year: i.year || null,
        })),
        message: `Tìm thấy phim thể loại "${genre}" thành công.`,
      };
    }
    return {
      movies: [],
      message: `Hiện chưa có phim thể loại "${genre}" trên hệ thống.`,
    };
  } catch (error) {
    console.error("[Genre API] Lỗi:", error?.response?.data || error.message);
    return {
      error: `Lỗi khi lấy phim thể loại "${genre}". Vui lòng thử lại sau.`,
    };
  }
};

const callMoviesByCountryAPI = async (
  country,
  sortField = "modified.time",
  sortType = "desc",
) => {
  try {
    const slug = resolveCountrySlug(country);
    if (!slug) {
      return {
        movies: [],
        message: `Quốc gia "${country}" không có trên CFlix. Các quốc gia hiện có: Việt Nam, Trung Quốc, Thái Lan, Hồng Kông, Pháp, Đức, Hà Lan, Mexico, Thụy Điển, Philippines, Đan Mạch, Thụy Sĩ, Ukraina, Hàn Quốc, Âu Mỹ, Ấn Độ, Canada, Tây Ban Nha, Indonesia, Ba Lan, Malaysia, Bồ Đào Nha, UAE, Châu Phi, Ả Rập Xê Út, Nhật Bản, Đài Loan, Anh, Thổ Nhĩ Kỳ, Nga, Úc, Brazil, Ý, Na Uy, Nam Phi.`,
      };
    }
    const url = `https://phimapi.com/v1/api/quoc-gia/${slug}?page=1&sort_field=${encodeURIComponent(sortField)}&sort_type=${sortType}&limit=5`;
    console.log(`[Country API] Gọi: ${url}`);
    const res = await axios.get(url);
    const items = res.data?.data?.items;
    if (items?.length > 0) {
      return {
        country_name: country,
        movies: items.map((i) => ({
          name: i.name,
          slug: i.slug,
          year: i.year || null,
        })),
        message: `Tìm thấy phim của "${country}" thành công.`,
      };
    }
    return {
      movies: [],
      message: `Hiện chưa có phim của quốc gia "${country}" trên hệ thống.`,
    };
  } catch (error) {
    console.error("[Country API] Lỗi:", error?.response?.data || error.message);
    return {
      error: `Lỗi khi lấy phim quốc gia "${country}". Vui lòng thử lại sau.`,
    };
  }
};

// ===================== FALLBACK =====================
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

// ===================== MAIN =====================
const chatWithAI = async (history) => {
  const systemInstruction = `Bạn là Jarvis, trợ lý AI thông minh của website xem phim CFlix.

NGUYÊN TẮC HOẠT ĐỘNG:
1. PHẠM VI TRẢ LỜI: Bạn chỉ tư vấn về lĩnh vực phim ảnh và giải trí. Bao gồm: thông tin phim, diễn viên, đạo diễn, thể loại, cốt truyện, đánh giá phim, lịch sử điện ảnh, gợi ý phim,...
2. CÂU HỎI NGOÀI PHẠM VI: Nếu người dùng hỏi những chủ đề không liên quan đến phim ảnh (thời tiết, toán học, lập trình, tin tức,...), hãy lịch sự từ chối: "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến phim ảnh và giải trí. Bạn có muốn tôi gợi ý một bộ phim hay không? 🎬"
3. NỘI DUNG THÔ TỤC: Tuyệt đối không trả lời các câu hỏi thô tục, khiếm nhã hoặc không phù hợp.

SỬ DỤNG CÔNG CỤ:
4. TÌM TÊN PHIM: Dùng 'search_kkphim' khi người dùng đề cập tên phim CỤ THỂ.
   KHÔNG dùng khi câu hỏi chỉ hỏi về thể loại hoặc quốc gia chung chung.

5. PHIM HOT / TOP VIEW: Dùng 'get_top_viewed_movies' CHỈ KHI người dùng hỏi top phim, phim xem nhiều nhất, phim hot/trending trên CFlix.

6. PHIM THEO THỂ LOẠI: Dùng 'get_movies_by_genre' khi người dùng muốn xem / gợi ý phim theo một thể loại. Ví dụ:
   'gợi ý phim hành động', 'cho xem phim kinh dị', 'phim tình cảm hay', 'có phim hài không', 'muốn xem phim cổ trang',...
   - Truyền đúng tên thể loại vào tham số "genre". Mặc định sort_field="modified.time", sort_type="desc".
   Các thể loại có trên CFlix: Hành Động, Cổ Trang, Tài Liệu, Thể Thao, Học Đường, Khoa Học, Miền Tây, Chiến Tranh, Bí Ẩn, Phiêu Lưu, Hài Hước, Thần Thoại, Trẻ Em, Viễn Tưởng, Tình Cảm, Âm Nhạc, Hình Sự, Chính Kịch, Lịch Sử, Kinh Dị, Tâm Lý, Gia Đình, Võ Thuật, Kinh Điển.

7. PHIM THEO QUỐC GIA: Dùng 'get_movies_by_country' khi người dùng muốn xem phim của một quốc gia cụ thể. Ví dụ:
   'phim Hàn Quốc hay', 'gợi ý phim Nhật Bản', 'cho xem phim Trung Quốc', 'phim Mỹ mới', 'phim Việt Nam', 'phim Thái',...
   - Truyền đúng tên quốc gia vào tham số "country". Ví dụ: country="Hàn Quốc", country="Nhật Bản".
   - Lưu ý: "phim Mỹ" hoặc "phim Âu" → country="Âu Mỹ".
   - Mặc định sort_field="modified.time", sort_type="desc".
   Các quốc gia có trên CFlix: Việt Nam, Trung Quốc, Thái Lan, Hồng Kông, Pháp, Đức, Hà Lan, Mexico, Thụy Điển, Philippines, Đan Mạch, Thụy Sĩ, Ukraina, Hàn Quốc, Âu Mỹ, Ấn Độ, Canada, Tây Ban Nha, Indonesia, Ba Lan, Malaysia, Bồ Đào Nha, UAE, Châu Phi, Ả Rập Xê Út, Nhật Bản, Đài Loan, Anh, Thổ Nhĩ Kỳ, Nga, Úc, Brazil, Ý, Na Uy, Nam Phi.

8. FORMAT KẾT QUẢ TỪ TOOL: Khi có kết quả từ Tool, PHẢI format đúng như sau:
   - Link Markdown: [Tên Phim](/phim/slug) — "Tên Phim" là tên thật của bộ phim, KHÔNG thay bằng "xem ngay" hay chữ khác.
   - Ví dụ ĐÚNG: [Batman Ninja](/phim/batman-ninja)
   - Ví dụ SAI: [xem ngay](/phim/batman-ninja)
   - Hãy giới thiệu ngắn gọn rồi liệt kê link từng phim.
   - Ngăn cách mỗi phim bằng dấu phẩy.

TRẢ LỜI TỰ DO (không dùng Tool):
9. Các câu hỏi chung về phim thì trả lời bằng kiến thức.
   TUYỆT ĐỐI KHÔNG tự tạo link Markdown. Chỉ liệt kê tên phim thuần túy.`;

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
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.1,
      max_tokens: 1024,
    });

    const responseMessage = response.choices[0].message;

    if (!responseMessage.tool_calls) {
      console.log("📝 [NO TOOL] Response content:", responseMessage.content);
      return { role: "assistant", content: responseMessage.content };
    }

    messages.push(responseMessage);

    for (const toolCall of responseMessage.tool_calls) {
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

      let apiResult;
      if (functionName === "search_kkphim") {
        apiResult = await callKKPhimAPI(args.keyword);
      } else if (functionName === "get_top_viewed_movies") {
        apiResult = await callTopViewedAPI();
      } else if (functionName === "get_movies_by_genre") {
        apiResult = await callMoviesByGenreAPI(
          args.genre,
          args.sort_field || "modified.time",
          args.sort_type || "desc",
        );
      } else if (functionName === "get_movies_by_country") {
        apiResult = await callMoviesByCountryAPI(
          args.country,
          args.sort_field || "modified.time",
          args.sort_type || "desc",
        );
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
      messages,
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
