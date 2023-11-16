// import * as QRCode from 'qrcode';
// import { QRCodeToDataURLOptions } from 'qrcode';

// async function generateQRCode(activityId: string): Promise<string> {
//   const data = `activityId:${activityId}`;
//   const options: QRCodeToDataURLOptions = {
//     type: 'image/svg+xml',
//     errorCorrectionLevel: 'H',
//     color: {
//       dark: '#000',
//       light: '#fff',
//     },
//   };

//   try {
//     // Tạo QR code và nhận dữ liệu URL của nó
//     const qrDataURL = await QRCode.toDataURL(data, options);

//     // Chuyển đổi dữ liệu URL thành chuỗi SVG
//     const svgString = qrDataURL.split(',')[1]; // Lấy phần dữ liệu sau dấu phẩy

//     return svgString;
//   } catch (error) {
//     console.error('Error generating QR code:', error);
//     throw error;
//   }
// }

// // Sử dụng hàm
// const activityId = '123';
// const qrCode = await generateQRCode(activityId);
// console.log(qrCode);
