import { expect } from 'chai';
import sinon from 'sinon';
const fs = require('fs');
import path from 'path';

// Import the function to be tested
import { uploadImageToFirebase } from '../api/v1/services/firebase.service';

describe('Upload Image Tests', () => {
  let storageStub: any;

  before(() => {
    // Create a stub for the Firebase Admin SDK
    storageStub = sinon.stub();
    storageStub.bucket = sinon.stub().returns({
      file: sinon.stub().returns({
        createWriteStream: sinon.stub().callsFake(() => ({
          on: (event: any, callback: any) => {
            if (event === 'finish') {
              callback();
            }
          },
        })),
      }),
    });

    // Stub the Firebase Admin SDK's storage method
    sinon.stub(require('firebase-admin'), 'storage').get(() => storageStub);
  });

  after(() => {
    // Restore the stub after all tests
    sinon.restore();
  });

  it('should upload an image successfully', async function(){
    // Provide the path to a local image file
    const filePath = '/Users/mew/Documents/kimkhanh/kimkhanh.png';
    this.timeout(5000);
    // Gọi hàm uploadImageToFirebase với đường dẫn tệp hình ảnh
    const remoteFileName = 'cat12.jpg';
    const uploadedImageUrl = await uploadImageToFirebase(filePath, remoteFileName);
  
    // Kiểm tra xem URL ảnh đã tải lên có phải là một chuỗi và không trống
    expect(uploadedImageUrl).to.be.a('string').and.not.to.be.empty;
  });
  

  it('should handle upload error', async () => {
    // Mock the input parameters
    const fileBuffer = Buffer.from('mocked file data'); // Buffer for file data
    const filename = 'kimkhanh.png'; // Filename as a string
  
    // Create a temporary file with the buffer data
    const tempFilePath = path.join(__dirname, 'temp', filename);
    fs.writeFileSync(tempFilePath, fileBuffer);
  
    // Stub the createWriteStream method to throw an error
    storageStub.bucket().file().createWriteStream.callsFake(() => {
      throw new Error('Fake upload error');
    });
  
    try {
      // Call the function to upload the image, which should throw an error
      await uploadImageToFirebase(tempFilePath, filename);
      // If no error is thrown, fail the test
      expect.fail('Expected an error to be thrown');
    } catch (err: any) {
      // Check that the error is an instance of Error and has the expected message
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Fake upload error');
    }
  
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
  });
  
});
