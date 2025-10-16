import express from 'express';
import certificateService from '../services/certificateService.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;

    const certificatePath = await certificateService.getCertificate(account_id);

    if (!fs.existsSync(certificatePath)) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    res.sendFile(path.resolve(certificatePath));
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/generate/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;

    const certificatePath = await certificateService.generateCertificate(account_id);

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      path: certificatePath
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
