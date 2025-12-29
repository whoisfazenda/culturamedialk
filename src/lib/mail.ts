import nodemailer from 'nodemailer';

const LOGO_URL = "https://test.culturamedia.ru/logo.png";
const PRIMARY_COLOR = "#7c3aed";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // Принудительно включаем SSL для порта 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

export async function sendWelcomeEmail(to: string, name: string, password: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Добро пожаловать в Cultura Media!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Cultura Media" style="max-width: 200px; height: auto;">
          </div>
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
            <a href="https://test.culturamedia.ru/login" style="background: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Войти в кабинет</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">Если вы не запрашивали доступ, проигнорируйте это письмо.</p>
        </div>
      `,
    });
    console.log("Welcome email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Пароль изменен - Cultura Media',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Cultura Media" style="max-width: 200px; height: auto;">
          </div>
          <h2>Привет, ${name}!</h2>
          <p>Ваш пароль в личном кабинете Cultura Media был успешно изменен.</p>
          <p>Если вы не совершали этого действия, пожалуйста, немедленно свяжитесь с поддержкой в тг: @culturamediasup </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://test.culturamedia.ru/login" style="background: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Войти в кабинет</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">Это автоматическое уведомление, на него не нужно отвечать.</p>
        </div>
      `,
    });
    console.log("Password change email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending password change email:", error);
    return { success: false, error };
  }
}

export async function sendReleaseStatusEmail(to: string, name: string, releaseTitle: string, status: 'APPROVED' | 'REJECTED', upc?: string, rejectionReason?: string, releaseId?: string) {
  const isApproved = status === 'APPROVED';
  const subject = isApproved ? `Релиз одобрен: ${releaseTitle}` : `Релиз отклонен: ${releaseTitle}`;
  
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Cultura Media" style="max-width: 200px; height: auto;">
          </div>
          <h2>Привет, ${name}!</h2>
          <p>Статус вашего релиза <strong>"${releaseTitle}"</strong> был изменен на: <span style="color: ${isApproved ? '#10b981' : '#ef4444'}; font-weight: bold;">${isApproved ? 'Одобрен' : 'Отклонен'}</span>.</p>
          
          ${isApproved ? `
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #bbf7d0;">
              <p style="margin: 0;"><strong>UPC:</strong> ${upc || 'Присваивается'}</p>
              <p style="margin: 10px 0 0;">Ваш релиз успешно прошел модерацию и скоро появится на площадках!</p>
            </div>
          ` : `
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #fecaca;">
              <p style="margin: 0;"><strong>Причина отклонения:</strong></p>
              <p style="margin: 5px 0 0; color: #b91c1c;">${rejectionReason || 'Не указана'}</p>
            </div>
          `}

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://test.culturamedia.ru/releases/${releaseId || ''}" style="background: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Посмотреть релиз</a>
          </div>
        </div>
      `,
    });
    console.log("Release status email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending release status email:", error);
    return { success: false, error };
  }
}

export async function sendPayoutStatusEmail(to: string, name: string, amount: number, status: 'PAID') {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Выплата произведена - Cultura Media',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Cultura Media" style="max-width: 200px; height: auto;">
          </div>
          <h2>Привет, ${name}!</h2>
          <p>Ваш запрос на вывод средств в размере <strong>${amount} ₽</strong> был успешно обработан.</p>
          <p>Средства поступят на ваши реквизиты в ближайшее время.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://test.culturamedia.ru/finance" style="background: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">История операций</a>
          </div>
        </div>
      `,
    });
    console.log("Payout status email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending payout status email:", error);
    return { success: false, error };
  }
}

export async function sendAnalyticsReadyEmail(to: string, name: string, quarter: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Новая аналитика доступна - Cultura Media',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Cultura Media" style="max-width: 200px; height: auto;">
          </div>
          <h2>Привет, ${name}!</h2>
          <p>Ваша статистика прослушиваний за <strong>${quarter}</strong> уже доступна в личном кабинете.</p>
          <p>Узнайте, как слушали ваши треки в этом периоде!</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://test.culturamedia.ru/analytics" style="background: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Смотреть аналитику</a>
          </div>
        </div>
      `,
    });
    console.log("Analytics ready email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending analytics email:", error);
    return { success: false, error };
  }
}

export async function sendRequestStatusEmail(to: string, name: string, requestType: string, status: 'DONE' | 'REJECTED') {
  const isDone = status === 'DONE';
  const subject = isDone ? `Запрос выполнен: ${requestType}` : `Запрос отклонен: ${requestType}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Cultura Media" style="max-width: 200px; height: auto;">
          </div>
          <h2>Привет, ${name}!</h2>
          <p>Ваш запрос <strong>"${requestType}"</strong> был рассмотрен. Статус: <span style="color: ${isDone ? '#10b981' : '#ef4444'}; font-weight: bold;">${isDone ? 'Выполнен' : 'Отклонен'}</span>.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://test.culturamedia.ru/tools/artist-card" style="background: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Мои запросы</a>
          </div>
        </div>
      `,
    });
    console.log("Request status email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending request status email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, name: string, tempPassword: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Временный пароль - Cultura Media',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Cultura Media" style="max-width: 200px; height: auto;">
          </div>
          <h2>Привет, ${name}!</h2>
          <p>Вы запросили восстановление пароля в личном кабинете Cultura Media.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px;">Ваш временный пароль:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 0; color: #7c3aed; text-align: center;">${tempPassword}</p>
          </div>
          <p><strong>Внимание:</strong> После входа в систему вам необходимо будет сразу сменить этот пароль на свой собственный.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://test.culturamedia.ru/login" style="background: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Войти и сменить пароль</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
        </div>
      `,
    });
    console.log("Password reset email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}