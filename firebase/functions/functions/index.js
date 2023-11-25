/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const os = require('os');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Thư viện để thực hiện nén ảnh



// Creates a client from a Google service account key
// const storage = new Storage({keyFilename: 'key.json'});

exports.compressImage = functions.storage.object().onFinalize(async (object) => {
  const fileBucket  = object.bucket;
  const filePath    = object.name; // đường dẫn vào file 
  const fileName    = path.basename(filePath); // tên file trước khi nén
  const bucket      = new Storage({
    // keyFilename: './bhx-clone-b7503af88ecf.json'
  }).bucket(fileBucket);

    // 1. khi upload ảnh lên storeage firebase
    // 2. nó sẽ trigger function: lắng nghe nghi có ảnh mới thêm vào storage
    // 3. nó sẽ chạy script file này đang viết nè -> là nén ảnh 
    // 4. cách nén:
        // lấy ảnh cũ
        // nén ra 1 ảnh mới
        // với tên file là 'cỏmpesssed_....' 
    // 5. khi nén ảnh xong thì nó lại thêm vào thư mục với tên file là 'compresssed_file...'
      // thì khi thêm ảnh sau khi nén vậy, nó lại trigger lại bước số 2
      // nên dẫn tới nó chạy hoài -> nó dừng là do nó báo cái tên file mình nó quá dài vì cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_cỏmpesssed_


  const EXCLUDE_FOLDER_COMPRESS = filePath.includes('/compressed');
  if (EXCLUDE_FOLDER_COMPRESS) {
    logger.info(`EXCLUDE_FOLDER_COMPRESS`, {
      EXCLUDE_FOLDER_COMPRESS,
      message: 'không thực hiện vì thư mục /compressed đã được nén ảnh'
    })
    return null;
  }

  const tempFilePath = path.join(os.tmpdir(), fileName);

  // Tải ảnh từ Firebase Storage xuống tạm thời
  await bucket.file(filePath).download({ destination: tempFilePath });

  // Nén ảnh với Sharp
  const compressedFilePath = path.join(os.tmpdir(), 'compressed_' + fileName); 
  await sharp(tempFilePath).resize(/* Kích thước mới */).toFile(compressedFilePath);

  
  const compressedFileName = 'compressed_' + fileName;
  // const compressedFileDestination = path.join(path.dirname(filePath), 'compressed', compressedFileName);
  const compressedFileDestination = path.join('compressed', path.dirname(filePath), compressedFileName);
  // nếu với structure hiện tại thì khó quản lý, cần thêm subfolder
    // /posts -> /compresssed/posts
    // /avatars -> /compressed/avatars
      
  logger.info(`compressedFileDestination`, {
    compressedFileDestination, message: 'thư mục lưu ảnh sau khi nén'
  })
  // Tải ảnh nén lên lại Firebase Storage
  await bucket.upload(compressedFilePath, {
    destination: compressedFileDestination, 
    metadata: {
      contentType: 'image/jpeg', 
    },
  });

  // Xóa tệp tạm thời
  return fs.unlinkSync(tempFilePath);
});
