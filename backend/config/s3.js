// src/config/s3.js
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

// -------------------------------------------------
// 1. S3 Client – shared for upload + delete
// -------------------------------------------------
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// -------------------------------------------------
// 2. Multer-S3 Storage (unchanged)
// -------------------------------------------------
const s3Storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
  key: (req, file, cb) => {
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}${path.extname(file.originalname)}`;
    cb(null, `channels/${req.params.channelId}/images/${fileName}`);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
});

// -------------------------------------------------
// 3. File filter (only images)
// -------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  cb(null, allowed.includes(file.mimetype));
};

// -------------------------------------------------
// 4. Multer middleware (upload)
// -------------------------------------------------
export const uploadChannelImage = multer({
  storage: s3Storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// -------------------------------------------------
// 5. DELETE helper – reusable anywhere
// -------------------------------------------------
/**
 * Delete a single object from S3.
 * @param {string} key - The S3 object key (e.g. "channels/abc123/images/xyz.png")
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async (key) => {
  if (!key) return; // nothing to delete

  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3.send(command);
    console.log(`Deleted from S3: ${key}`);
  } catch (err) {
    console.error(`Failed to delete S3 object ${key}:`, err);
    // Throw if you want the caller to handle failure
    throw err;
  }
};