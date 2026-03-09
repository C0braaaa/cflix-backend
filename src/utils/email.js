import { Resend } from "resend";
import { env } from "~/config/environment";

const resend = new Resend(env.RESEND_API_KEY);

const sendEmail = async (options) => {
  await resend.emails.send({
    from: "Cflix Support <onboarding@resend.dev>",
    to: options.email,
    subject: options.subject,
    html: options.html,
  });
};

export default sendEmail;
