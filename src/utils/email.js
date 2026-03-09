import axios from "axios";
import { env } from "~/config/environment";

const sendEmail = async (options) => {
  // Cấu hình dữ liệu theo chuẩn API của Brevo
  const emailData = {
    sender: { name: "Cflix Support", email: env.SMTP_USER },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html,
  };

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      emailData,
      {
        headers: {
          accept: "application/json",
          "api-key": env.SMTP_PASS,
          "content-type": "application/json",
        },
      },
    );
    console.log("Email gửi thành công qua API:", response.data.messageId);
  } catch (error) {
    console.error("Lỗi API Brevo:", error.response?.data || error.message);
  }
};

export default sendEmail;
