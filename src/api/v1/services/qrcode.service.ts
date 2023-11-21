import QRCode from 'qrcode-svg';

export async function generateQRCode(postId: string): Promise<string> {
  const data = `postId:${postId}`;

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
