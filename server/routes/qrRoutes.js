const router = require('express').Router();
const QRCode = require('qrcode');

router.get('/:ticketNumber', async (req, res, next) => {
  try {
    const { ticketNumber } = req.params;
    const qrData = {
      ticketNumber,
      verifiedAt: new Date().toISOString(),
      system: 'QueueWise'
    };

    const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
    res.json({ qrCodeUrl: dataUrl });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
