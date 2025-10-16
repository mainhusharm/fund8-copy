import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = `Welcome to ${process.env.COMPANY_NAME}!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${process.env.COMPANY_NAME}!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.full_name || 'Trader'},</p>
            <p>Thank you for joining ${process.env.COMPANY_NAME}! We're excited to have you on board.</p>
            <p>You're now part of an elite community of traders. Here's what you can do next:</p>
            <ul>
              <li>Browse our challenge options</li>
              <li>Select a challenge that fits your trading style</li>
              <li>Start your journey to becoming a funded trader</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/pricing" class="button">View Challenges</a>
            <p>If you have any questions, our support team is here to help!</p>
            <p>Best regards,<br>The ${process.env.COMPANY_NAME} Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${process.env.COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendChallengeStartedEmail(user, account) {
    const subject = 'Your Challenge Has Started!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .credential-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Challenge Started!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.full_name || 'Trader'},</p>
            <p>Your challenge has been activated and is now live!</p>

            <div class="credentials">
              <h3>MT5 Account Credentials</h3>
              <div class="credential-row">
                <strong>Account Number:</strong>
                <span>${account.account_number}</span>
              </div>
              <div class="credential-row">
                <strong>Password:</strong>
                <span>${account.password}</span>
              </div>
              <div class="credential-row">
                <strong>Server:</strong>
                <span>${account.server}</span>
              </div>
              <div class="credential-row">
                <strong>Initial Balance:</strong>
                <span>$${account.initial_balance.toLocaleString()}</span>
              </div>
            </div>

            <div class="warning">
              <strong>Important Rules:</strong>
              <ul>
                <li>Maximum Daily Loss: ${account.challenges.max_daily_loss}%</li>
                <li>Maximum Total Loss: ${account.challenges.max_total_loss}%</li>
                <li>Profit Target: $${account.profit_target.toLocaleString()}</li>
                <li>Minimum Trading Days: ${account.challenges.min_trading_days || 'N/A'}</li>
              </ul>
            </div>

            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>

            <p>Good luck with your challenge!</p>
            <p>Best regards,<br>The ${process.env.COMPANY_NAME} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendRuleViolationEmail(account, violation) {
    const { data: user } = await supabase.from('users').select('*').eq('id', account.user_id).single();

    const subject = violation.severity === 'critical' ? 'URGENT: Rule Violation Detected' : 'Warning: Rule Violation';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${violation.severity === 'critical' ? '#dc3545' : '#ffc107'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .violation { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${violation.severity === 'critical' ? '#dc3545' : '#ffc107'}; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${violation.severity === 'critical' ? 'Critical Rule Violation' : 'Rule Violation Warning'}</h1>
          </div>
          <div class="content">
            <p>Hi ${user.full_name || 'Trader'},</p>
            <p>${violation.severity === 'critical' ? 'Your account has been suspended due to a critical rule violation.' : 'A rule violation has been detected on your account.'}</p>

            <div class="violation">
              <h3>Violation Details</h3>
              <p><strong>Rule:</strong> ${violation.rule.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Current Value:</strong> ${violation.value.toFixed(2)}%</p>
              <p><strong>Allowed Limit:</strong> ${violation.limit}%</p>
              <p><strong>Severity:</strong> ${violation.severity.toUpperCase()}</p>
            </div>

            ${violation.severity === 'critical' ? '<p><strong>Your account has been automatically suspended. Please contact support for more information.</strong></p>' : '<p>Please review your trading strategy to avoid further violations.</p>'}

            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>

            <p>Best regards,<br>The ${process.env.COMPANY_NAME} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendChallengePassedEmail(account) {
    const { data: user } = await supabase.from('users').select('*').eq('id', account.user_id).single();

    const subject = 'Congratulations! You Passed Your Challenge!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
          .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.full_name || 'Trader'},</p>
            <p>Fantastic news! You've successfully passed your challenge!</p>

            <div class="success">
              <h3>Challenge Results</h3>
              <p><strong>Final Balance:</strong> $${account.balance.toLocaleString()}</p>
              <p><strong>Profit Target:</strong> $${account.profit_target.toLocaleString()}</p>
              <p><strong>Total Profit:</strong> $${(account.balance - account.initial_balance).toLocaleString()}</p>
            </div>

            <p>Our team will review your account and contact you within 24-48 hours regarding the next steps.</p>

            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Certificate</a>

            <p>Congratulations again on this achievement!</p>
            <p>Best regards,<br>The ${process.env.COMPANY_NAME} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendDailyProgressEmail(user, account, metrics) {
    const subject = 'Your Daily Trading Progress';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Daily Progress Report</h1>
          </div>
          <div class="content">
            <p>Hi ${user.full_name || 'Trader'},</p>
            <p>Here's your daily trading progress:</p>

            <div class="stats">
              <div class="stat-row">
                <strong>Current Balance:</strong>
                <span>$${metrics.balance.toLocaleString()}</span>
              </div>
              <div class="stat-row">
                <strong>Today's P&L:</strong>
                <span style="color: ${metrics.profit >= 0 ? '#28a745' : '#dc3545'}">
                  ${metrics.profit >= 0 ? '+' : ''}$${metrics.profit.toFixed(2)}
                </span>
              </div>
              <div class="stat-row">
                <strong>Daily Drawdown:</strong>
                <span>${metrics.daily_drawdown.toFixed(2)}%</span>
              </div>
              <div class="stat-row">
                <strong>Max Drawdown:</strong>
                <span>${metrics.max_drawdown.toFixed(2)}%</span>
              </div>
              <div class="stat-row">
                <strong>Trading Days:</strong>
                <span>${metrics.trading_days}</span>
              </div>
              <div class="stat-row">
                <strong>Consistency Score:</strong>
                <span>${metrics.consistency_score.toFixed(1)}/100</span>
              </div>
            </div>

            <p>Keep up the great work!</p>
            <p>Best regards,<br>The ${process.env.COMPANY_NAME} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(user.email, subject, html);
  }
}

export default new EmailService();
