import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string, password: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Добро пожаловать в Cultura Media!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #7c3aed;">Cultura Media</h1>
          <h2>Привет, ${name}!</h2>
          <p>Ваш аккаунт в личном кабинете артиста Cultura Media успешно создан.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px;">Ваши данные для входа:</p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 5px;"><strong>Email:</strong> ${to}</li>
              <li><strong>Пароль:</strong> <span style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px; font-family: monospace;">${password}</span></li>
            </ul>
          </div>
          <p>Пожалуйста, войдите в систему и смените пароль в настройках профиля.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://lk.cultura.media/login" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Войти в кабинет</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">Если вы не запрашивали доступ, проигнорируйте это письмо.</p>
        </div>
      `,
    });
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}