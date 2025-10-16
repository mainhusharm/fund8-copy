import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase.js';

class CertificateService {
  async generateCertificate(accountId) {
    try {
      const { data: account } = await supabase
        .from('mt5_accounts')
        .select('*, challenges(*), users:user_id(*)')
        .eq('id', accountId)
        .single();

      if (!account || account.status !== 'passed') {
        throw new Error('Account not found or has not passed');
      }

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const certificatePath = path.join(process.cwd(), 'certificates', `${accountId}.pdf`);

      if (!fs.existsSync(path.join(process.cwd(), 'certificates'))) {
        fs.mkdirSync(path.join(process.cwd(), 'certificates'), { recursive: true });
      }

      const writeStream = fs.createWriteStream(certificatePath);
      doc.pipe(writeStream);

      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fillAndStroke('#f8f9fa', '#667eea');

      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke('#667eea');

      doc.fontSize(48)
        .fillColor('#667eea')
        .text('CERTIFICATE OF ACHIEVEMENT', 80, 100, { align: 'center' });

      doc.fontSize(24)
        .fillColor('#333333')
        .text('This certifies that', 0, 200, { align: 'center' });

      doc.fontSize(36)
        .fillColor('#667eea')
        .text(account.users.full_name || account.users.email, 0, 250, { align: 'center' });

      doc.fontSize(18)
        .fillColor('#333333')
        .text('has successfully completed the', 0, 310, { align: 'center' });

      doc.fontSize(28)
        .fillColor('#667eea')
        .text(account.challenges.name, 0, 350, { align: 'center' });

      const profit = account.balance - account.initial_balance;
      const profitPercentage = (profit / account.initial_balance * 100).toFixed(2);

      doc.fontSize(16)
        .fillColor('#333333')
        .text(`Initial Balance: $${account.initial_balance.toLocaleString()}`, 0, 420, { align: 'center' })
        .text(`Final Balance: $${account.balance.toLocaleString()}`, 0, 445, { align: 'center' })
        .text(`Total Profit: $${profit.toLocaleString()} (${profitPercentage}%)`, 0, 470, { align: 'center' });

      const passedDate = new Date(account.passed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(14)
        .fillColor('#666666')
        .text(`Completed on ${passedDate}`, 0, 520, { align: 'center' });

      doc.fontSize(12)
        .text(`Certificate ID: ${accountId}`, 0, 550, { align: 'center' });

      doc.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', async () => {
          await supabase
            .from('certificates')
            .insert({
              user_id: account.user_id,
              mt5_account_id: accountId,
              challenge_id: account.challenge_id,
              certificate_path: certificatePath,
              issued_at: new Date().toISOString()
            });

          resolve(certificatePath);
        });

        writeStream.on('error', reject);
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  async getCertificate(accountId) {
    const { data: certificate } = await supabase
      .from('certificates')
      .select('*')
      .eq('mt5_account_id', accountId)
      .single();

    if (!certificate) {
      return await this.generateCertificate(accountId);
    }

    return certificate.certificate_path;
  }
}

export default new CertificateService();
