import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Readable } from 'stream';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import { parse, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

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
    const fileName = file.name.substring(file.name.lastIndexOf('/') + 1);
    
    // Add "compressed_" to the beginning of the file name
    const compressedFileName = `compressed_${fileName}`;
    
    // Construct the new path with the updated file name
    const newPath = file.name.substring(0, file.name.lastIndexOf('/') + 1) + compressedFileName;
    stream.on('finish', () => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/compressed%2F${encodeURIComponent(newPath)}?alt=media`;
      console.log('Uploaded image URL:', imageUrl);
      resolve(imageUrl);
    });

    // Ghi dữ liệu tải lên trực tiếp vào stream
    stream.end(fileData.buffer);
  });
};


export const getImageSize = async (imageUrl: any) => {
  const response = await fetch(imageUrl, { method: 'HEAD' });
  return parseInt(response.headers.get('content-length') || 'N/A');
};


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'tochucthiennguyen.lienhe@gmail.com', // replace with your Gmail email address
    pass: 'yrugjalwndpxueak', // replace with your Gmail app password or account password
  },
});
export const sendVerificationEmail = async (userEmail: string, datailPost: any) => {
  try {
    const indochinaDate = new Date(datailPost.dateActivity);
    const vietnamTimeZone = 'Asia/Ho_Chi_Minh';

    const formattedDate = indochinaDate.toLocaleString('en-US', {
      timeZone: vietnamTimeZone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
 
    const mailOptions = {
      from: 'tochucthiennguyen.lienhe', 
      to: userEmail,
      subject: 'Đăng ký tình nguyện',
      html: `<h1>Thông báo Đăng ký Tham gia Hoạt động</h1>
            <p>Bạn đã đăng ký tham gia hoạt động thành công</p>
        
            <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-top: 20px;">
              <h2>${datailPost.title}</h2>
              <p><strong>Ngày tổ chức:</strong> ${formattedDate}</p>
              <p><strong>Địa điểm:</strong> ${datailPost.address}</p>
              <p><strong>Mô tả:</strong> ${datailPost.content}</p>
            </div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};
