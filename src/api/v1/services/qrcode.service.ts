import QRCode from 'qrcode-svg';

export async function generateQRCode(activityId: string): Promise<string> {
  const data = `activityId:${activityId}`;

  // Pass options directly to the QRCode constructor
  const qr = new QRCode(data);

  try {
    const svgString = qr.svg();
    return svgString;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}
