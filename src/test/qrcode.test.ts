import {generateQRCode} from '../api/v1/services/qrcode.service'; // Adjust the path accordingly

describe('generateQRCode', () => {
  it('should generate a valid SVG QR code', async () => {
    const activityId = '123';
    const qrCode = await generateQRCode(activityId);
    expect(qrCode).toContain('<svg'); 
  });
});
