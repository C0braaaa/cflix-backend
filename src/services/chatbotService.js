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
  const fallbackMessages = messages
    .filter((m) => m.role !== "tool")
    .map((m) => {
      // Inject thêm cảnh báo vào system message của fallback
      if (m.role === "system") {
        return {
          ...m,
          content:
            m.content +
            "\n\nCHÚ Ý ĐẶC BIỆT (QUAN TRỌNG NHẤT): TUYỆT ĐỐI KHÔNG tạo ra bất kỳ đường link Markdown nào dạng [text](url) trong phản hồi này. Chỉ được liệt kê tên phim thuần túy, không có link đi kèm.",
        };
      }
      return m;
    });
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: fallbackMessages,
    temperature: 0.2,
    max_tokens: 1024,
  });
  return stripFakeMarkdownLinks(response.choices[0].message.content);
};

// ===================== ENRICH WITH REAL LINKS =====================
// Khi AI trả lời bằng kiến thức (no tool), ta extract tên phim → search song song → append link thật
const enrichResponseWithLinks = async (content) => {
  try {
    // Bước 1: Truncate content trước khi gửi cho AI (tiết kiệm token, giảm latency)
    const truncated = content.slice(0, 800);

    const extractResponse = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: `Liệt kê tất cả tên phim được đề cập trong đoạn văn sau. Chỉ trả về JSON array thuần túy, không có markdown, không giải thích. Ví dụ: ["Inception", "The Dark Knight"]\n\n"${truncated}"`,
        },
      ],
      temperature: 0,
      max_tokens: 150,
    });

    const rawText = extractResponse.choices[0].message.content.trim();
    const match = rawText.match(/\[[\s\S]*?\]/);
    if (!match) return stripFakeMarkdownLinks(content);

    let movieNames;
    try {
      movieNames = JSON.parse(match[0]);
    } catch {
      return stripFakeMarkdownLinks(content);
    }

    if (!Array.isArray(movieNames) || movieNames.length === 0)
      return stripFakeMarkdownLinks(content);

    // Deduplicate + giới hạn 5 phim
    const uniqueNames = [...new Set(movieNames)].slice(0, 5);
    console.log("[Enrich] Tên phim extracted:", uniqueNames);

    // Bước 2: Search TẤT CẢ song song (Promise.all thay vì for...of tuần tự)
    const searchResults = await Promise.all(
      uniqueNames.map((name) => callKKPhimAPI(name)),
    );

    const foundLinks = searchResults
      .map((result, i) => {
        if (result.movies && result.movies.length > 0) {
          const best = result.movies[0];
          console.log(`[Enrich] Tìm thấy: ${best.name} → /phim/${best.slug}`);
          return `[${best.name}](/phim/${best.slug})`;
        }
        return null;
      })
      .filter(Boolean);

    const strippedContent = stripFakeMarkdownLinks(content);
    if (foundLinks.length === 0) return strippedContent;

    // Bước 3: Append section "Xem trên CFlix" với link thật
    return `${strippedContent}\n\n🎬 **Xem trên CFlix:** ${foundLinks.join(", ")}`;
  } catch (e) {
    console.error("[Enrich] Lỗi:", e);
    return stripFakeMarkdownLinks(content);
  }
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

8. ĐỊNH DẠNG HIỂN THỊ TÊN PHIM (RẤT QUAN TRỌNG):
   - Khi gợi ý phim từ kết quả của Tool, BẮT BUỘC chỉ trả về 1 link markdown duy nhất cho mỗi phim.
   - TUYỆT ĐỐI KHÔNG lặp lại tên phim ở trước hoặc sau link. KHÔNG thêm bất kỳ ký tự nào như gạch ngang (—), dấu gạch nối (-), dấu hai chấm (:) ở cạnh tên phim.
   - Cấu trúc ĐÚNG VÀ DUY NHẤT: [Tên Phim](/phim/slug)
   - VÍ DỤ ĐÚNG (Chỉ trả về mỗi link): [Batman Ninja](/phim/batman-ninja)
   - VÍ DỤ SAI (BỊ CẤM, TUYỆT ĐỐI KHÔNG LÀM THEO): 
     + SAI (có text dư thừa): Batman Ninja — [Batman Ninja](/phim/batman-ninja)
     + SAI (sai text link): [xem ngay](/phim/batman-ninja)
     + SAI (có text dư thừa): Tên phim: [Batman Ninja](/phim/batman-ninja)
   - PHONG CÁCH TRẢ LỜI: Nếu người dùng hỏi dạng Có/Không (ví dụ: "Có phim X không?", "Thế có phim Hàn không?"), BẮT BUỘC phải mở đầu bằng cách xác nhận "Có". Sau đó thêm 1-2 câu dẫn chuyện tự nhiên, thân thiện.
   - TUYỆT ĐỐI KHÔNG trả lời rập khuôn theo kiểu "Một số phim đang được yêu thích...". Hãy linh hoạt và giống con người hơn.
   - Trình bày danh sách phim: Liệt kê các link markdown của phim liên tiếp nhau, ngăn cách bằng dấu phẩy. KHÔNG DÙNG gạch đầu dòng cho mỗi phim.

TRẢ LỜI TỰ DO (không dùng Tool):
9. CÁC TRƯỜNG HỢP SAU ĐÂY TUYỆT ĐỐI KHÔNG ĐƯỢC GỌI TOOL, chỉ trả lời bằng kiến thức:
   - Câu hỏi về chủ đề phim ảnh chung: "phim về du hành thời gian", "phim có cú lật kèo", "phim chữa lành", "phim kinh điển nhất mọi thời đại"...
   - Câu hỏi về diễn viên, đạo diễn: "Christopher Nolan đạo diễn phim gì", "Leonardo DiCaprio nổi tiếng với phim nào"...
   - Câu hỏi kiến thức điện ảnh: "Phim Titanic giành bao nhiêu Oscar", "Avatar là phim gì"...
   - Câu gợi ý theo cảm xúc/tình huống: "Gợi ý phim buổi tối xem cùng gia đình", "Phim nào hợp cho ngày mưa"...
   ⚠️ Với những câu trên: KHÔNG dùng tool. Chỉ LIỆT KÊ TÊN PHIM THUẦN TÚY (không có link, không có dấu ngoặc, không có URL).`;

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
      // Enrich: tìm phim được đề cập và append link thật vào cuối response
      const enrichedContent = await enrichResponseWithLinks(
        responseMessage.content,
      );
      return { role: "assistant", content: enrichedContent };
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

    const rawToolContent = finalResponse.choices[0].message.content;
    console.log("🔧 [TOOL RESPONSE] Raw content:", rawToolContent);
    console.log(
      "🔧 [TOOL RESPONSE] Has markdown links?",
      /\[.*?\]\(.*?\)/.test(rawToolContent),
    );

    // QUAN TRỌNG: Luôn đi qua enrichResponseWithLinks để strip slug bịa
    // và build lại link thật từ API — tránh model tự hallucinate slug
    const enrichedToolContent = await enrichResponseWithLinks(rawToolContent);
    console.log("✅ [TOOL RESPONSE] Enriched content:", enrichedToolContent);

    return { role: "assistant", content: enrichedToolContent };
  } catch (error) {
    if (
      error?.error?.error?.code === "tool_use_failed" ||
      error?.status === 400
    ) {
      console.warn("[Groq AI] tool_use_failed, fallback không dùng tool...");
      try {
        const rawFallback = await chatWithoutTools(messages);
        const enrichedFallback = await enrichResponseWithLinks(rawFallback);
        return { role: "assistant", content: enrichedFallback };
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
