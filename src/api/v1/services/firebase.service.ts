import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Readable } from 'stream';
import sharp from 'sharp';

const admin = require('firebase-admin');
const serviceAccount = require('../../../config/firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'bhx-clone.appspot.com',
});

const bucket = admin.storage().bucket();
const storage = new Storage();

export const uploadImageToFirebase = async (
  localFilePath: string,
  filename: string
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const file = bucket.file(filename);
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg',
        firebaseStorageDownloadTokens: uuidv4(),
      },
    });

    stream.on('error', (error: Error) => {
      console.error('Error uploading image:', error);
      reject(error);
    });

    stream.on('finish', () => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${file.name}?alt=media`;

      console.log('Uploaded image URL:', imageUrl);
      resolve(imageUrl);
    });

    // Read the local file as a Buffer and stream it to Firebase Storage
    const fileBuffer = fs.readFileSync(localFilePath);
    stream.end(fileBuffer);
  });
};



export const uploadImageFromFormData = async (fileData: any, remoteFileName: any) => {
  return new Promise(async (resolve, reject) => {
    // console.log('This avatar has: ' + fileData.size);
    // console.log('Content-Type:', fileData.mimetype);

    const file = bucket.file(remoteFileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg',
        firebaseStorageDownloadTokens: uuidv4()
      },
    });

    stream.on('error', (error: any) => {
      console.error('Error uploading image:', error);
      reject(error);
    });

    stream.on('finish', () => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;
      console.log('Uploaded image URL:', imageUrl);
      resolve(imageUrl);
    });

    // Ghi dữ liệu tải lên trực tiếp vào stream
    stream.end(fileData.buffer);
  });
};

export const uploadAndProcessImage = async (fileData: any, remoteFileName: any) => {
  try {
    // Giảm dung lượng hình ảnh trước khi tải lên
    const processedImageBuffer = await sharp(fileData.buffer)
      .resize({ width: 800 }) // Điều chỉnh kích thước (width: 800 pixel, tự điều chỉnh tỷ lệ chiều cao)
      .jpeg({ quality: 70 }) // Nén hình ảnh sang định dạng JPEG với chất lượng 70%
      .toBuffer();
    const imageUrl = await uploadImageFromFormData(
      {
        buffer: processedImageBuffer,
        size: processedImageBuffer.length,
        mimetype: 'image/jpeg',
      },
      remoteFileName
    );

    return imageUrl;
  } catch (error) {
    console.error('Error processing and uploading image:', error);
    throw error;
  }
};


export const getImageSize = async (imageUrl: any) => {
  const response = await fetch(imageUrl, { method: 'HEAD' });
  return parseInt(response.headers.get('content-length') || 'N/A');
};


