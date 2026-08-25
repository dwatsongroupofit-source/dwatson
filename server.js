const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware with full cross-origin resource sharing (CORS) for Vercel frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from project root (for local preview)
app.use(express.static(path.join(__dirname)));

// Configure Nodemailer Transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Mail Server is ready to deliver messages from:', process.env.EMAIL_USER);
  }
});

// Root API Status Endpoint (for Railway dashboard / health probes)
app.get('/', (req, res) => {
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  const hasIndexHtml = require('fs').existsSync(path.join(__dirname, 'index.html'));

  if (acceptsHtml && hasIndexHtml) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }

  res.json({
    service: 'D. Watson Official Portal Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      sendInquiry: 'POST /api/send-inquiry'
    },
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'D. Watson Backend API',
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    timestamp: new Date().toISOString()
  });
});

// Direct Customer Inquiry Endpoint
app.post('/api/send-inquiry', async (req, res) => {
  try {
    const { name, email, department, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, email address, and inquiry message.'
      });
    }

    const dept = department || 'General Inquiry';
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Karachi',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const adminReceiver = process.env.NOTIFICATION_RECEIVER || process.env.EMAIL_USER;

    // 1. Mail to Admin / Store Owner
    const adminMailOptions = {
      from: `"D. Watson Portal" <${process.env.EMAIL_USER}>`,
      to: adminReceiver,
      replyTo: `"${name}" <${email}>`,
      subject: `🏥 [D. Watson Inquiry] ${dept} — From ${name}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">D. WATSON CHEMIST & DEPARTMENT STORE</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #93C5FD; text-transform: uppercase; font-weight: 600;">Direct Inquiry Desk Alert</p>
            </div>

            <!-- Body -->
            <div style="padding: 28px;">
              <div style="background: #EFF6FF; border-left: 4px solid #2563EB; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <span style="font-size: 14px; font-weight: 600; color: #1E40AF;">New Customer Inquiry Received</span>
                <div style="font-size: 12px; color: #64748B; margin-top: 2px;">Time (PKT): ${now}</div>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 14px; width: 35%;">Customer Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-weight: 600; font-size: 15px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 14px;">Customer Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #2563EB; font-weight: 600; font-size: 14px;"><a href="mailto:${email}" style="color: #2563EB; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 14px;">Department:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-weight: 600; font-size: 14px;">
                    <span style="background: #E0E7FF; color: #3730A3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">${dept}</span>
                  </td>
                </tr>
              </table>

              <!-- Customer Message Box -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Customer Inquiry Message:</div>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #1E293B; white-space: pre-wrap;">${message}</div>
              </div>

              <!-- Quick Reply Action Note -->
              <div style="background: #F0FDF4; border: 1px dashed #86EFAC; padding: 14px; border-radius: 8px; text-align: center;">
                <div style="font-size: 13px; color: #166534; font-weight: 600;">👉 Simply click "Reply" in your email client to write directly to ${name} (${email}).</div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #F1F5F9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
              D. Watson Chemist & Superstore • Automated Website Notification System
            </div>
          </div>
        </div>
      `
    };

    // 2. Auto-Reply Confirmation Mail to Customer
    const customerMailOptions = {
      from: `"D. Watson Customer Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting D. Watson Chemist (${dept})`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">D. WATSON CHEMIST & SUPERSTORE</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #93C5FD;">Serving Islamabad & Rawalpindi with Genuine Medicines Since 1970</p>
            </div>

            <!-- Body -->
            <div style="padding: 28px;">
              <h2 style="font-size: 18px; color: #0F172A; margin-top: 0;">Dear ${name},</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Thank you for reaching out to <strong>D. Watson Direct Inquiry Desk</strong>. We have received your inquiry regarding <strong>${dept}</strong>.
              </p>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Your Inquiry Summary:</div>
                <div style="font-size: 13px; line-height: 1.5; color: #1E293B; white-space: pre-wrap;">${message}</div>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Our concerned department representative is reviewing your message and will reply to this email shortly.
              </p>

              <!-- Urgent Prescription / WhatsApp Notice -->
              <div style="background: #FEF3C7; border: 1px solid #FCD34D; padding: 14px; border-radius: 8px; margin-top: 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #92400E; margin-bottom: 4px;">⚡ Need Urgent Medicine or Express Delivery?</div>
                <div style="font-size: 12px; color: #78350F; line-height: 1.4;">
                  You can directly contact our 24/7 Pharmacy WhatsApp Desk at <strong>0332-9716666</strong> or <strong>051-2826666</strong> for immediate assistance.
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #F1F5F9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
              <div>D. Watson Chemist & Superstore • Islamabad & Rawalpindi</div>
              <div style="margin-top: 4px;">Email: dwatsonconsultation@gmail.com | Phone: 051-2826666</div>
            </div>
          </div>
        </div>
      `
    };

    // Send emails concurrently
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions).catch(err => {
        console.warn('⚠️ Could not send auto-reply to customer:', err.message);
      })
    ]);

    console.log(`✅ Direct Inquiry Email delivered to ${adminReceiver} for customer: ${name} (${email})`);

    return res.status(200).json({
      success: true,
      message: 'Inquiry dispatched successfully! Notification email sent.'
    });

  } catch (error) {
    console.error('❌ Error sending inquiry email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send inquiry email. Please try again or reach us on WhatsApp.'
    });
  }
});

// Fallback route to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 D. Watson Portal running on http://localhost:${PORT}`);
});
