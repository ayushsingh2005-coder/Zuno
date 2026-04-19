const transporter = require("../config/nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;