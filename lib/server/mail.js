import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // Add timeout to prevent hanging
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });

        // Verify connection configuration
        await transporter.verify().catch(err => {
            console.error("Email transport verification failed:", err);
            throw new Error(`Email configuration error: ${err.message}`);
        });

        const result = await transporter.sendMail({
            from: `Abaya Designs <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`Email sent successfully to ${to}`);
        return result;
    } catch (error) {
        console.error("Failed to send email:", error);
        // Don't throw the error - we want to continue even if email fails
        return { error: error.message, success: false };
    }
} 