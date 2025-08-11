const nodemailer = require("nodemailer");

console.log(" sendMail.js loaded");
console.log("✅ Email environment loaded for:", process.env.EMAIL_USER);

const sendMail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"iNotebook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });

    console.log(`✅ Email sent successfully to: ${to}`);
    console.log(` Subject: ${subject}`);
    console.log(` Gmail Response: ${info.response}`);
  } catch (error) {
    console.error(` Failed to send email to: ${to}`);
    console.error(` Error Code: ${error.code || "N/A"}`);
    console.error(` Error Message: ${error.message}`);
  }
};

module.exports = sendMail;
