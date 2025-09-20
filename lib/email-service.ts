import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = (to: string, subject: string, html: string) => {
  resend.emails.send({
    from: "onboarding@resend.dev",
    to: to,
    subject: subject,
    html: html,
  });
};

export { sendEmail };
