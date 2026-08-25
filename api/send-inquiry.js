const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, department, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Name, Email, and Message are mandatory.'
      });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const adminReceiver = process.env.NOTIFICATION_RECEIVER || emailUser;

    if (!emailUser || !emailPass) {
      return res.status(500).json({
        success: false,
        error: 'Email service credentials not configured in environment.'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const dept = department || 'General Inquiry';
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Karachi',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    // 1. Send Admin Email
    const adminMailOptions = {
      from: `"D. Watson Portal" <${emailUser}>`,
      to: adminReceiver,
      replyTo: `"${name}" <${email}>`,
      subject: `🏥 [D. Watson Inquiry] ${dept} — From ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">D. WATSON CHEMIST & DEPARTMENT STORE</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #93C5FD; text-transform: uppercase;">Direct Inquiry Alert</p>
            </div>
            <div style="padding: 28px;">
              <p><strong>Customer:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Department:</strong> ${dept}</p>
              <p><strong>Received At:</strong> ${now}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
            </div>
          </div>
        </div>
      `
    };

    // 2. Send Customer Receipt Email
    const customerMailOptions = {
      from: `"D. Watson Support" <${emailUser}>`,
      to: email,
      subject: `Inquiry Received: D. Watson Consultation Desk (${dept})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">D. WATSON CHEMIST</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #93C5FD;">Confirmation Receipt</p>
            </div>
            <div style="padding: 28px;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for reaching out to D. Watson Chemist & Superstore. We have received your inquiry regarding <strong>${dept}</strong>.</p>
              <p>Our team will get back to you shortly at <strong>${email}</strong>.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748B;">Helpline: 051-8438111 | WhatsApp: 0332-9716666</p>
            </div>
          </div>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions).catch(e => console.warn('Customer auto-reply failed:', e.message))
    ]);

    return res.status(200).json({
      success: true,
      message: 'Inquiry dispatched successfully! Notification email sent.'
    });
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send inquiry email.'
    });
  }
};
