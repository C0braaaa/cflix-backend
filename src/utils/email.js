import nodemailer from "nodemailer";
import { env } from "~/config/environment";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"Cflix Support" <${env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.log("Lỗi gửi mail cụ thể từ Brevo:", error); // Log này sẽ cứu vãn mọi thứ
  }
};

export default sendEmail;
