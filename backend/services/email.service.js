const nodemailer = require("nodemailer");

const { assertEnv } = require("../config/env");

// ======================================
// TRANSPORTER
// ======================================

let transporter;

const getTransporter = () => {
    const user = assertEnv("EMAIL_USER", "email-service");
    const pass = assertEnv("EMAIL_PASS", "email-service");

    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user,
                pass
            }
        });
    }

    return transporter;
};

// ======================================
// ENVIAR EMAIL
// ======================================

const sendEmail = async ({

    to,
    subject,
    html,
    text

}) => {

    const user = assertEnv("EMAIL_USER", "email-service");
    const fromName = process.env.EMAIL_FROM_NAME || "TravelGo";

    if (!to) {
        const error = new Error("Destinatario requerido");
        error.statusCode = 400;
        throw error;
    }

    const result = await getTransporter().sendMail({

        from: `"${fromName}" <${user}>`,
        to,
        subject,
        html,
        text

    });

    return {
        messageId: result.messageId,
        accepted: result.accepted || []
    };

};

module.exports = sendEmail;
